import { defineGenerator } from '../defineGenerator'

export default defineGenerator({
  command:
    'npm config set init-author-name Author && rm -rf fresh-lib && npx tsdx create fresh-lib --template=basic && mv fresh-lib fresh-app',
  description: 'Fresh library',
  repoDescriptionOverride:
    'Fresh TypeScript library built with TSDX, automatically generated everyday from its official generator script and template',
  frameworkUrl: 'https://tsdx.io/',
  frameworkDocumentationUrl: 'https://tsdx.io/',
})
