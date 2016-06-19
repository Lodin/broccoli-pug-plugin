import path from 'path';
import {readFile, readFileSync} from 'fs-promise';
import {Builder} from 'broccoli';
import Pug from '../src';

const fixturesPath = path.join(__dirname, 'fixtures');
const expectsPath = path.join(__dirname, 'expects');

describe('Pug broccoli plugin', () => {
  it('should compile pug code to html', done => {
    const nodes = new Pug(fixturesPath);

    return (new Builder(nodes)).build().then(async() => {
      const fixturePath = path.join(nodes.outputPath, 'basic-compile.html');
      const fixture = await readFile(fixturePath, 'utf8');
      const expectPath = path.join(expectsPath, 'basic-compile.html');
      const expectation = await readFile(expectPath, 'utf8');
      expect(fixture).toEqual(expectation);
      done();
    });
  });

  it('should compile locals', done => {
    const nodes = new Pug(fixturesPath, {}, {
      pageTitle: 'Pug',
      youAreUsingPug: true
    });

    return (new Builder(nodes)).build().then(async() => {
      const fixturePath = path.join(expectsPath, 'locals-compile.html');
      const fixture = await readFile(fixturePath, 'utf8');
      const expectPath = path.join(expectsPath, 'locals-compile.html');
      const expectation = await readFile(expectPath, 'utf8');

      expect(fixture).toEqual(expectation);
      done();
    });
  });

  it('should work with inner folders', done => {
    const nodes = new Pug(fixturesPath);

    return (new Builder(nodes)).build().then(async() => {
      const fxPathLvl1 = path.join(nodes.outputPath, 'level-1',
          'basic-compile-lvl-1.html');
      const fxPathLvl2 = path.join(nodes.outputPath, 'level-1', 'level-2',
          'basic-compile-lvl-2.html');
      const fxLvl1 = await readFile(fxPathLvl1, 'utf8');
      const fxLvl2 = await readFile(fxPathLvl2, 'utf8');
      const exPathLvl1 = path.join(expectsPath, 'level-1',
          'basic-compile-lvl-1.html');
      const exPathLvl2 = path.join(expectsPath, 'level-1', 'level-2',
          'basic-compile-lvl-2.html');

      const exLvl1 = await readFile(exPathLvl1, 'utf8');
      const exLvl2 = await readFile(exPathLvl2, 'utf8');

      expect(fxLvl1).toEqual(exLvl1);
      expect(fxLvl2).toEqual(exLvl2);
      done();
    });
  });

  it('should not compile file with extensions differs from `.pug`', done => {
    const nodes = new Pug(fixturesPath);

    return (new Builder(nodes)).build().then(() => {
      expect(() => {
        readFileSync(
            path.join(nodes.outputPath, 'basic-not-compile.js'),
            'utf8'
        );
      }).toThrow();
      done();
    });
  });

  it('should take single node or multiple nodes', () => {
    expect(() => {
      new Pug([fixturesPath, expectsPath]);
      new Pug(fixturesPath);
    }).not.toThrow();
  });

  it('should remove broccoli plugin options from option list', () => {
    const pug = new Pug(fixturesPath, {persistentOutput: true});
    expect(pug.options.persistentOutput).toBeUndefined();
  });
});
