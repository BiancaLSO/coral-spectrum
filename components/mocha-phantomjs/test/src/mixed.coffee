expect = chai?.expect or require('chai').expect

describe 'Tests Mixed', ->

  it 'passes 1', -> expect(1).to.be.ok
  it 'passes 2', -> expect(2).to.be.ok
  it 'passes 3', -> expect(3).to.be.ok

  it 'skips 1'
  it 'skips 2'
  it 'skips 3'

  it 'fails 1', -> expect(false).to.be.true
  it 'fails 2', -> expect(false).to.be.true
  it 'fails 3', -> expect(false).to.be.true

  it 'passes 4', -> expect(1).to.be.ok
  it 'passes 5', -> expect(2).to.be.ok
  it 'passes 6', -> expect(3).to.be.ok

  it 'fails 4', -> expect(false).to.be.true
  it 'fails 5', -> expect(false).to.be.true
  it 'fails 6', -> expect(false).to.be.true

  it 'skips 4'
  it 'skips 5'
  it 'skips 6'

