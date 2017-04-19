var chai = require('chai');

var Normalizer = require('../');

var expect = chai.expect;

describe('Normalizer', function() {
  var testConverter;
  beforeEach(function() {
    testConverter = function(val) {
      return Number(val) + 1;
    };
    Normalizer.define('addOne', testConverter);
  });

  afterEach(function() {
    Normalizer.undefine('addOne');
  });

  it('should be able to add a new converter', function() {
    expect(Normalizer.getConverter('addOne').toString()).to.equal(testConverter.toString());
  });

  it('should be able convertable if specific converter exists', function() {
    expect(Normalizer.canConvert('addOne')).to.equal(true);
    expect(Normalizer.canConvert(['addOne'])).to.equal(true);
    expect(Normalizer.canConvert('regexp')).to.equal(false);
  });

  it('should be converted as number and add 1 as result', function() {
    var result = new Normalizer('12').to('addOne');
    expect(result).to.equal(13);
    expect(typeof result).to.equal('number');
  });

  it('should allow convert array as specific type', function() {
    expect(Normalizer.convert(1, ['number'])).eql([1]);
    expect(Normalizer.convert('1,2', ['number'], { arrayItemDelimiters: ',' })).eql([1,2]);
    expect(function() {
      Normalizer.convert(1, ['number', 'string']);
    }).to.throw(Error);
  });

  it('should try to convert value for allowed type', function() {
    expect(Normalizer.tryConvert(1, ['number'])).eql([1]);
    expect(Normalizer.tryConvert('1,2', ['number'], { arrayItemDelimiters: ',' })).eql([1,2]);
    expect(Normalizer.tryConvert(1, ['number', 'string'])).to.eq(1);
    expect(Normalizer.tryConvert({}, ['number', 'string'])).to.deep.eq({});
  });

  it('should be converted as number', function() {
    expect(new Normalizer(undefined).to('number')).to.equal(undefined);
    expect(new Normalizer(null).to('number')).to.equal(null);
    expect(new Normalizer('123').to('number')).to.equal(123);
    expect(new Normalizer('-123').to('number')).to.equal(-123);
    expect(new Normalizer('-123.1.1').to('number')).to.be.a('number');
  });

  it('should be converted as date', function() {
    var date = new Date('2015-01-01 00:00:00');
    expect(new Normalizer(undefined).to('date')).to.equal(undefined);
    expect(new Normalizer(null).to('date')).to.equal(null);
    expect(new Normalizer('2015-01-01 00:00:00').to('date')).to.eql(date);
    expect(new Normalizer(date).to('date')).to.equal(date);
    expect(new Normalizer('abcdefg').to('date')).to.be.a('date');
    expect(new Normalizer('abcdefg').to('date').toString()).to.equal('Invalid Date');
  });

  it('should be converted as string', function() {
    expect(new Normalizer(undefined).to('string')).to.equal(undefined);
    expect(new Normalizer(null).to('string')).to.equal(null);
    expect(new Normalizer(123).to('string')).to.eql('123');
    expect(new Normalizer(-123).to('string')).to.equal('-123');
  });


  it('should be converted as any', function() {
    expect(new Normalizer(undefined).to('any')).to.equal(undefined);
    expect(new Normalizer('undefined').to('any')).to.equal(undefined);
    expect(new Normalizer(null).to('any')).to.equal(null);
    expect(new Normalizer('null').to('any')).to.equal(null);
    expect(new Normalizer('123').to('any')).to.equal(123);
    expect(new Normalizer(123).to('any')).to.equal(123);
    expect(new Normalizer([123]).to('any')).to.eql([123]);
    expect(new Normalizer({ a: 1 }).to('any')).to.eql({ a: 1 });
    expect(new Normalizer({ a: '1' }).to('any')).to.eql({ a: 1 });

    var circularExample = {};
    circularExample.anotherCircularReference = circularExample;
    expect(function() {
      new Normalizer(circularExample).to('any');
    }).not.to.throw(Error);
  });

  it('should be converted as array', function() {
    expect(new Normalizer(undefined).to('array')).to.deep.equal([]);
    expect(new Normalizer('undefined').to('array')).to.deep.equal([undefined]);
    expect(new Normalizer(null).to('array')).to.deep.equal([null]);
    expect(new Normalizer('null').to('array')).to.deep.equal([null]);
    expect(new Normalizer('123').to('array')).to.deep.equal([123]);
    expect(new Normalizer(123).to('array')).to.deep.equal([123]);
    expect(new Normalizer([123]).to('array')).to.deep.eql([123]);
    expect(new Normalizer({ a: 1 }).to('array')).to.deep.eql([{ a: 1 }]);
    expect(new Normalizer({ a: '1' }).to('array')).to.deep.eql([{ a: 1 }]);

    expect(Normalizer.convert({ a: '1' }, ['array'])).to.deep.eql([[{ a: 1 }]]);
    expect(Normalizer.convert('undefined', ['array'])).to.deep.eql([[undefined]]);
    expect(Normalizer.convert(undefined, ['array'])).to.deep.eql([]);
    expect(Normalizer.convert(null, ['array'])).to.deep.eql([[null]]);

    var circularExample = {};
    circularExample.anotherCircularReference = circularExample;
    expect(function() {
      new Normalizer(circularExample).to('any');
    }).not.to.throw(Error);
  });

  it('should be converted as object', function() {
    expect(new Normalizer(undefined).to('object')).to.equal(undefined);
    expect(new Normalizer('undefined').to('object')).to.equal(undefined);
    expect(new Normalizer(null).to('object')).to.equal(null);
    expect(new Normalizer('null').to('object')).to.equal(null);
    expect(new Normalizer('123').to('object')).to.equal(123);
    expect(new Normalizer(123).to('object')).to.equal(123);
    expect(new Normalizer([123]).to('object')).to.eql([123]);
    expect(new Normalizer({ a: 1 }).to('object')).to.eql({ a: 1 });
    expect(new Normalizer({ a: '1' }).to('object')).to.eql({ a: 1 });

    var circularExample = {};
    circularExample.anotherCircularReference = circularExample;
    expect(function() {
      new Normalizer(circularExample).to('object');
    }).not.to.throw(Error);
  });

  it('should be converted as boolean', function() {
    expect(new Normalizer(undefined).to('boolean')).to.equal(undefined);
    expect(new Normalizer(NaN).to('boolean')).to.equal(false);
    expect(new Normalizer(null).to('boolean')).to.equal(false);
    expect(new Normalizer(true).to('boolean')).to.equal(true);
    expect(new Normalizer('true').to('boolean')).to.equal(true);
    expect(new Normalizer('boolean?').to('boolean')).to.equal(true);
    expect(new Normalizer('').to('boolean')).to.equal(false);
    expect(new Normalizer(false).to('boolean')).to.equal(false);
    expect(new Normalizer('undefined').to('boolean')).to.equal(false);
    expect(new Normalizer('null').to('boolean')).to.equal(false);
    expect(new Normalizer('false').to('boolean')).to.equal(false);
  });
});
