import { defineGenerator } from '../../defineGenerator'
import { readFile, readdir } from 'fs/promises'

export default defineGenerator({
  // command: [
  //   'pnpm create turbo fresh-app --package-manager pnpm --skip-install',
  //   'cd fresh-app',
  //   'corepack use pnpm@latest',

  //   // Set up changeset
  //   'pnpm add -Dw @changesets/cli @changesets/changelog-github',
  //   'pnpm changeset init',
  //   'jq ".changelog=[\\"@changesets/changelog-github\\", { \\"repo\\": \\"softnetics/replace-app-name\\" }] | .privatePackages={\\"tag\\": true, \\"version\\": true}" .changeset/config.json > tmp.json && mv tmp.json .changeset/config.json',

  //   // remove unused packages
  //   'rm -rf ./apps ./packages',

  //   'mkdir apps-client',
  //   'mkdir apps-api',
  //   'mkdir packages',

  //   // modify pnpm-workspace.yaml
  //   'echo "packages:\n  - apps-*/*\n  - packages/*\n  - tools/*\n" > pnpm-workspace.yaml',

  //   // replace @repo/* with @app-name/*
  //   // 'find . -type f -name "package.json" -not -path "./node_modules/*" -exec sed -i -e "s/@repo/@replace-app-name/g" {} \\;',

  //   // create projects-config package
  //   'mkdir packages/project-configs',
  //   'echo \'{"name":"@replace-app-name/project-configs","version":"0.0.0","private":true,"type":"module","scripts":{"lint":"eslint .","format":"prettier --write ."}}\' > packages/project-configs/package.json',
  //   'pnpm add -D --filter @replace-app-name/project-configs @eslint/js @types/eslint__js @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-plugin-jsx-a11y eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-simple-import-sort eslint-plugin-unused-imports typescript-eslint',

  //   // prettier
  //   'mkdir packages/project-configs/prettier',
  //   "echo \"// @ts-check\n\n /** @type {import('prettier').Config} */ \nconst config = {\n singleQuote: true, semi: false, printWidth: 100, tabWidth: 2, trailingComma: 'es5', }\nexport default config\" > packages/project-configs/prettier/base.js",

  //   // eslint
  //   'mkdir packages/project-configs/eslint',

  //   // add prettier root config
  //   'echo "import config from \'@replace-app-name/project-configs/prettier/base.js\'\nexport default config" > .prettierrc.mjs',
  //   'jq ".devDependencies.\\"@replace-app-name/project-configs\\"=\\"workspace:*\\" | .scripts.\\"format\\"=\\"prettier --write .\\"" package.json > tmp.json && mv tmp.json package.json',
  //   'pnpm install',

  //   'pnpm format',

  //   // 'pnpm build --filter=web',
  // ].join('\n'),
  script: async (t) => {
    async function sendAndWait$(text: string) {
      await t.send(text)
      await t.waitForText('$')
    }

    async function writeFileEOF(path: string, content: string, waitFor = '$') {
      await t.send(`cat <<EOF > ${path}`)
      await t.send(content)
      await t.send('EOF')
      await t.waitForText(waitFor)
    }

    async function copyFilesFromDir(
      fromDir: string,
      toDir: string,
      waitFor = '$',
    ) {
      for (const file of await readdir(fromDir)) {
        await writeFileEOF(
          `${toDir}/${file}`,
          await readFile(`${fromDir}/${file}`, 'utf8'),
          waitFor,
        )
      }
    }

    async function copyFile(fromFile: string, toFile: string, waitFor = '$') {
      await writeFileEOF(toFile, await readFile(fromFile, 'utf8'), waitFor)
    }

    await sendAndWait$(
      'pnpm create turbo fresh-app --package-manager pnpm --skip-install',
    )
    await sendAndWait$('cd fresh-app')

    await sendAndWait$('volta pin node@lts && volta pin pnpm@latest')

    await sendAndWait$(
      'pnpm add -Dw @changesets/cli @changesets/changelog-github',
    )

    await sendAndWait$('pnpm changeset init')
    await sendAndWait$(
      'jq ".changelog=[\\"@changesets/changelog-github\\", { \\"repo\\": \\"softnetics/replace-app-name\\" }] | .privatePackages={\\"tag\\": true, \\"version\\": true}" .changeset/config.json > tmp.json && mv tmp.json .changeset/config.json',
    )

    await sendAndWait$('rm -rf ./apps ./packages')

    await sendAndWait$('mkdir apps-client')
    await sendAndWait$('mkdir apps-api')
    await sendAndWait$('mkdir packages')

    const workspaceYaml = await readFile(
      'src/generators/fresh-turbo-with-changeset/workspace.yaml',
      'utf8',
    )
    await writeFileEOF('pnpm-workspace.yaml', workspaceYaml)

    // create project-configs package
    await sendAndWait$('mkdir packages/project-configs')
    const projectConfigPackageJson = await readFile(
      'src/generators/fresh-turbo-with-changeset/project-configs/package-temp.json',
      'utf8',
    )
    await writeFileEOF(
      'packages/project-configs/package.json',
      projectConfigPackageJson,
    )
    await sendAndWait$(
      'pnpm add -D --filter @replace-app-name/project-configs @eslint/js @types/eslint__js @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-plugin-jsx-a11y eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-simple-import-sort eslint-plugin-unused-imports typescript-eslint',
    )

    // prettier
    await sendAndWait$('mkdir packages/project-configs/prettier')
    copyFilesFromDir(
      'src/generators/fresh-turbo-with-changeset/project-configs/prettier',
      'packages/project-configs/prettier',
    )

    // eslint
    await sendAndWait$('mkdir packages/project-configs/eslint')
    await copyFilesFromDir(
      'src/generators/fresh-turbo-with-changeset/project-configs/eslint',
      'packages/project-configs/eslint',
    )

    // tsconfig
    await sendAndWait$('mkdir packages/project-configs/tsconfig')
    await copyFilesFromDir(
      'src/generators/fresh-turbo-with-changeset/project-configs/tsconfig',
      'packages/project-configs/tsconfig',
    )

    await sendAndWait$(
      'jq ".devDependencies.\\"@replace-app-name/project-configs\\"=\\"workspace:*\\" | .scripts.\\"format\\"=\\"prettier --write .\\" | .name=\\"replace-app-name\\"" package.json > tmp.json && mv tmp.json package.json',
    )
    await sendAndWait$('pnpm install')

    await copyFile(
      'src/generators/fresh-turbo-with-changeset/prettierrc-temp.mjs',
      '.prettierrc.mjs',
    )

    await copyFile(
      'src/generators/fresh-turbo-with-changeset/.prettierignore-temp',
      '.prettierignore',
    )

    await copyFile(
      'src/generators/fresh-turbo-with-changeset/eslint-temp.config.mjs',
      'eslint.config.mjs',
    )

    // create ui package
    await sendAndWait$('mkdir packages/react-ui')
    await copyFile(
      'src/generators/fresh-turbo-with-changeset/react-ui/package-temp.json',
      'packages/react-ui/package.json',
    )
    await copyFile(
      'src/generators/fresh-turbo-with-changeset/react-ui/tsconfig-temp.json',
      'packages/react-ui/tsconfig.json',
    )
    await sendAndWait$(
      'pnpm add -D --filter @replace-app-name/react-ui tsx tailwindcss style-dictionary && pnpm add --filter @replace-app-name/react-ui tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react react',
    )

    await copyFile(
      'src/generators/fresh-turbo-with-changeset/react-ui/components.txt',
      'packages/react-ui/components.json',
      'fresh-app$',
    )

    await sendAndWait$('mkdir packages/react-ui/src')
    await sendAndWait$('mkdir packages/react-ui/src/utils')
    await copyFile(
      'src/generators/fresh-turbo-with-changeset/react-ui/src/utils/index.txt',
      'packages/react-ui/src/utils/index.ts',
    )

    await sendAndWait$('cd packages/react-ui')
    await t.send('npx shadcn add button')
    await t.waitForText('(y)')
    await sendAndWait$('y')

    await sendAndWait$('cd ../..')

    // extend volta all package.json files
    await t.send(
      'find . -type f -name "package.json" -not -path "./node_modules/*" -not -path ./package.json -exec bash -c \'cat <<< $(jq ".volta.extends=\\"../../package.json\\"" $0) > $0\' {} \\;',
    )
    await t.waitForText('fresh-app$')

    await sendAndWait$('pnpm format')
  },
  displayedCommand: 'pnpm create turbo --package-manager pnpm',
  description: 'Fresh monorepo',
  longDescription: 'Fresh monorepo, built with Turborepo',
  frameworkUrl: 'https://turborepo.org/',
  frameworkDocumentationUrl: 'https://turborepo.org/docs',
})
