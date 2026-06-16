# Klaro and Webpack

This example shows how to import and use Klaro as a package via webpack.

**Note:** This example uses pnpm workspace linking, so it imports the local Klaro package from the repository root during development.

To install the dependencies, run

    pnpm install

To build the distribution files, simply run

    pnpm run build

To run a development server run

    pnpm run dev

You can then go to http://localhost:9000 and should see the Klaro consent
manager with a very simple configuration.
