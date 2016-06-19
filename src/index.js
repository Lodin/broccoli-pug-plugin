import path from 'path';
import {readFile, writeFile} from 'fs-promise';
import {render} from 'pug';
import mkdirp from 'mkdirp-then';
import Plugin from 'broccoli-plugin';
import walk from 'walk-sync';

/**
 * Broccoli plugin that compiles pug to html code.
 */
export default class Pug extends Plugin {

  /**
   * Creates a new Pug plugin instance. For more info see
   * {@link https://github.com/broccolijs/broccoli-plugin}
   *
   * @param {Node|Node[]} inputNodes List of input nodes
   * @param {Object} options Plugin options
   * @param {Object} locals Pug local variables should be inject to the code
   */
  constructor(inputNodes, options = {}, locals = {}) {
    super(Array.isArray(inputNodes) ? inputNodes : [inputNodes], {
      name: 'Pug',
      annotation: options.annotation,
      persistentOutput: options.persistentOutput ?
          options.persistentOutput :
          false
    });
    delete options.annotation;
    delete options.persistentOutput;

    /**
     * Plugin options. Equal to Pug options
     * {@link http://jade-lang.com/api/}
     *
     * @type {Object}
     */
    this.options = options;

    /**
     * Pug local variables to inject to the code
     * @type {Object}
     */
    this.locals = locals;
  }

  /**
   * Builds received nodes.
   *
   * Walks over all files in the directory, asynchronously reads it, compiles
   * through pug and writes the compiled data to the output folder.
   */
  async build() {
    const [inputPath] = this.inputPaths;

    for (let fname of walk(inputPath)) {
      if (fname.slice(-4) !== '.pug') {
        continue;
      }

      const code = await readFile(`${inputPath}/${fname}`, 'utf8');
      const output = render(code, Object.assign(this.options, this.locals));

      const resultFname = fname.replace('.pug', '.html');
      const outputFilename = `${this.outputPath}/${resultFname}`;

      await mkdirp(path.dirname(outputFilename));
      await writeFile(outputFilename, output);
    }
  }
}
