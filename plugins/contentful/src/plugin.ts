import { registerDataPlugin } from '@builder.io/data-plugin-tools';
import pkg from '../package.json';
import contentful from 'contentful';
import qs from 'qs';

const pluginId = pkg.name;
const metaFields = ['environment', 'space', 'revision', 'type'];

registerDataPlugin(
  {
    id: pluginId,
    name: 'Contentful',
    icon:
      'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fd6097cd40fef4b94b18a3e0c4c53584d',
    settings: [
      {
        name: 'spaceId',
        type: 'string',
        required: true,
        helperText:
          'Get your space ID, from your contentful space settings > API Keys https://www.contentful.com/developers/docs/references/authentication/',
      },
      {
        name: 'accessToken',
        type: 'string',
        required: true,
        helperText:
          'Get your access token, from your contentful space settings > API Keys https://www.contentful.com/developers/docs/references/authentication/',
      },
    ],
    ctaText: `Connect your Contentful space`,
  },
  // Observable map of the settings configured above
  async settings => {
    const spaceId = settings.get('spaceId')?.trim();
    const accessToken = settings.get('accessToken')?.trim();
    const client = await contentful.createClient({
      space: spaceId,
      accessToken,
    });
    return {
      async getResourceTypes() {
        const contentTypes = await client.getContentTypes();
        return contentTypes.items.map(type => ({
          name: type.name,
          id: type.sys.id,
          canPickEntries: true,
          inputs: () => {
            const acceptableFields = type.fields.filter(field =>
              ['Text', 'Boolean', 'Number', 'Symbol'].includes(field.type)
            );
            const fields: any = [
              {
                name: 'include',
                friendlyName: 'limit',
                defaultValue: 10,
                // contentful api restricts include to be between 0 and 10
                min: 0,
                max: 10,
                type: 'number',
              },
              {
                name: 'order',
                type: 'string',
                enum: Object.keys(type.sys)
                  .filter(key => !metaFields.includes(key))
                  .map(key => ({
                    label: key,
                    value: `sys.${key}`,
                  }))
                  .concat(
                    acceptableFields
                      .filter(field => field.type === 'Symbol')
                      .map(field => ({
                        label: field.name,
                        value: `fields.${field.id}`,
                      }))
                  ),
              },
            ];

            if (acceptableFields.length > 0) {
              fields.push({
                name: 'fields',
                advanced: true,
                type: 'object',
                friendlyName: `${type.name} fields`,
                subFields: acceptableFields.map(field => ({
                  type: field.type === 'Symbol' ? 'text' : field.type.toLowerCase(),
                  name: field.id,
                  friendlyName: field.name,
                  helperText: `Query by a specific "${field.name}"" on ${type.name}`,
                })),
              } as any);
            }

            return fields;
          },
          toUrl: (options: any) => {
            // by entry
            // https://cdn.contentful.com/spaces/{space_id}/environments/{environment_id}/entries/{entry_id}?access_token={access_token}
            if (options.entry) {
              // todo: maybe environment should be an input
              return `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries/${options.entry}?access_token=${accessToken}`;
            }
            let fields =
              (options.fields && Object.keys(options.fields).length > 0 && options.fields) || null;
            if (fields) {
              fields = Object.keys(fields).reduce((acc, key) => {
                const omitValue = fields[key] === '';
                return {
                  ...acc,
                  ...(omitValue ? {} : { [key]: fields[key] }),
                };
              }, {});
            }

            const params = qs.stringify(
              { ...options, fields, access_token: accessToken, content_type: type.sys.id },
              { allowDots: true, skipNulls: true }
            );
            // by query
            return `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?${params}`;
          },
        }));
      },
      async getEntriesByResourceType(id: string, options) {
        const displayField = await client.getContentType(id).then(type => type.displayField);
        const entries = await client
          .getEntries({
            content_type: id,
            ...(options?.searchText && { query: options?.searchText }),
          })
          .then(res => res.items);

        return entries.map((entry: any) => ({
          id: entry.sys.id,
          name: entry.fields[displayField] as string,
        }));
      },
    };
  }
);
