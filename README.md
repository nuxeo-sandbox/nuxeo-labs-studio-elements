# About nuxeo-labs-studio-elements

A Nuxeo Package that provides a set of commonly used [Polymer](https://www.polymer-project.org/1.0/) Web components via a vulcanized elements file. This is intended for creating widgets and layouts that use Polymer via Nuxeo Studio.

## Usage

Install the Nuxeo Package in your server.

In your widget/layout xhtml in Studio, make sure you have the following imports:

    <h:outputScript src="/nuxeo-labs-studio-elements/bower_components/webcomponentsjs/webcomponents-lite.min.js" target="" />
    <h:outputScript src="/nuxeo-labs-studio-elements/bower_components/moment/min/moment-with-locales.min.js" target="" />
    <nxr:import src="/nuxeo-labs-studio-elements/elements/elements.vulcanized.html" target="" />

You can then use any of the elements that have been imported via `nuxeo-labs-studio-elements-web/bower.json` (and their dependencies of course). You may also refer to `nuxeo-labs-studio-elements-web/src/main/app/elements/elements.html` for a more granular list of the available elements.

If you want to add more element(s), update `nuxeo-labs-studio-elements-web/bower.json` with the new import and add them to `nuxeo-labs-studio-elements-web/src/main/app/elements/elements.html`.

You can perform a quick test of your new elements by adding them to `nuxeo-labs-studio-elements-web/src/main/app/index.html` and using `gulp serve` from within `nuxeo-labs-studio-elements-web`.

An example widget is provided in the `example` folder.

## Building

The project is under CI:

<a href='https://qa.nuxeo.org/jenkins/job/Sandbox/job/sandbox_nuxeo-labs-studio-elements-master/'><img src='https://qa.nuxeo.org/jenkins/buildStatus/icon?job=Sandbox/sandbox_nuxeo-labs-studio-elements-master'></a>

After cloning, and assuming `maven` is correctly installed:

    `mvn install`

The Nuxeo Package will be placed in `nuxeo-labs-studio-elements-np/target/`.

## Support

**These features are not part of the Nuxeo Production platform.**

These solutions are provided for inspiration and we encourage customers to use them as code samples and learning resources.

This is a moving project (no API maintenance, no deprecation process, etc.) If any of these solutions are found to be useful for the Nuxeo Platform in general, they will be integrated directly into platform, not maintained here.

## Licensing

[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

## About Nuxeo

Nuxeo dramatically improves how content-based applications are built, managed and deployed, making customers more agile, innovative and successful. Nuxeo provides a next generation, enterprise ready platform for building traditional and cutting-edge content oriented applications. Combining a powerful application development environment with SaaS-based tools and a modular architecture, the Nuxeo Platform and Products provide clear business value to some of the most recognizable brands including Verizon, Electronic Arts, Netflix, Sharp, FICO, the U.S. Navy, and Boeing. Nuxeo is headquartered in New York and Paris.

More information is available at [www.nuxeo.com](http://www.nuxeo.com).
