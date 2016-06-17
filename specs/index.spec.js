import {expect} from 'chai';
import {readFile, readFileSync} from 'fs-promise';
import {join} from 'path';
import {Builder} from 'broccoli';
import Pug from '../src';

describe('Pug broccoli plugin', () => {
  it('should compile pug code to html', done => {
    const nodes = new Pug(join(__dirname, 'fixtures'));

    return (new Builder(nodes)).build().then(async() => {
      const fixturePath = join(nodes.outputPath, 'basic-compile.html');
      const fixture = await readFile(fixturePath, 'utf8');
      const expectsPath = join(__dirname, 'expects', 'basic-compile.html');
      const expectation = await readFile(expectsPath, 'utf8');
      expect(fixture).to.equal(expectation);
      done();
    });
  });

  it('should compile locals', done => {
    const nodes = new Pug(join(__dirname, 'fixtures'), {}, {
      pageTitle: 'Pug',
      youAreUsingPug: true
    });

    return (new Builder(nodes)).build().then(async() => {
      const fixturePath = join(__dirname, 'expects', 'locals-compile.html');
      const fixture = await readFile(fixturePath, 'utf8');
      const expectsPath = join(__dirname, 'expects', 'locals-compile.html');
      const expectation = await readFile(expectsPath, 'utf8');

      expect(fixture).to.equal(expectation);
      done();
    });
  });

  it('should work with inner folders', done => {
    const nodes = new Pug(join(__dirname, 'fixtures'));

    return (new Builder(nodes)).build().then(async() => {
      const fxPathLvl1 = join(nodes.outputPath, 'level-1',
          'basic-compile-lvl-1.html');
      const fxPathLvl2 = join(nodes.outputPath, 'level-1', 'level-2',
          'basic-compile-lvl-2.html');
      const fxLvl1 = await readFile(fxPathLvl1, 'utf8');
      const fxLvl2 = await readFile(fxPathLvl2, 'utf8');
      const exPathLvl1 = join(__dirname, 'expects', 'level-1',
          'basic-compile-lvl-1.html');
      const exPathLvl2 = join(__dirname, 'expects', 'level-1', 'level-2',
          'basic-compile-lvl-2.html');

      const exLvl1 = await readFile(exPathLvl1, 'utf8');
      const exLvl2 = await readFile(exPathLvl2, 'utf8');

      expect(fxLvl1).to.equal(exLvl1);
      expect(fxLvl2).to.equal(exLvl2);
      done();
    });
  });

  it('should not compile file with extensions differs from `.pug`', done => {
    const nodes = new Pug(join(__dirname, 'fixtures'));

    return (new Builder(nodes)).build().then(() => {
      expect(() => {
        readFileSync(join(nodes.outputPath, 'basic-not-compile.js'), 'utf8');
      }).to.throw(Error);
      done();
    });
  });

  it('should take single node or multiple nodes', () => {
    expect(() => {
      new Pug([join(__dirname, 'fixtures'), join(__dirname, 'expects')]);
      new Pug(join(__dirname, 'fixtures'));
    }).to.not.throw(TypeError);
  });

  it('should remove broccoli plugin options from option list', () => {
    const pug = new Pug(join(__dirname, 'fixtures'), {
      persistentOutput: true
    });

    expect(pug.options.persistentOutput).to.be.undefined;
  });
});
