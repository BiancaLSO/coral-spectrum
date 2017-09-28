describe('Coral.Table.Cell', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('Cell');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      const el = helpers.build(new Coral.Table.Cell());
      expect(el.classList.contains('coral-Table-cell')).to.be.true;
    });
    
    it('should be possible using document.createElement', function() {
      const el = helpers.build(document.createElement('td', {is: 'coral-table-cell'}));
      expect(el.classList.contains('coral-Table-cell')).to.be.true;
    });
  });

  describe('API', function() {
    describe('#content', function() {
      it('should exist', function() {
        const el = new Coral.Table.Cell();
        expect(el.content).to.equal(el);
      });
    });
    
    describe('#value', function() {
      it('should default to empty string', function() {
        const el = new Coral.Table.Cell();
        expect(el.value).to.equal('');
      });
      
      it('should be reflected', function() {
        const el = new Coral.Table.Cell();
        el.value = 'test';
        expect(el.value).to.equal('test');
        expect(el.getAttribute('value')).to.equal('test');
      });
  
      it('should be settable by attribute', function() {
        const el = new Coral.Table.Cell();
        el.setAttribute('value', 'test');
        expect(el.value).to.equal('test');
        expect(el.getAttribute('value')).to.equal('test');
      });
    });
    
    describe('#selected', function() {
      it('should be selected', function() {
        const el = new Coral.Table.Cell();
        el.selected = true;
  
        expect(el.selected).to.be.true;
        expect(el.classList.contains('is-selected')).to.be.true;
        expect(el.getAttribute('aria-selected')).to.equal('true');
      });
    });
  });
  
  describe('Events', function() {
    
    describe('#coral-table-cell:_beforeselectedchanged', function() {
      it('should trigger before selection changed', function(done) {
        const el = new Coral.Table.Cell();
        
        el.on('coral-table-cell:_beforeselectedchanged', function() {
          expect(el.selected).to.be.false;
          done();
        });
        el.selected = true;
      });
    });
  
    describe('#coral-table-cell:_selectedchanged', function() {
      it('should trigger when selection changed', function(done) {
        const el = new Coral.Table.Cell();
  
        el.on('coral-table-cell:_selectedchanged', function() {
          expect(el.selected).to.be.true;
          done();
        });
        el.selected = true;
      });
    });
  });
  
  describe('Implementation Details', function() {
    it('should set a11y attribute', function() {
      const el = helpers.build(new Coral.Table.Cell());
      expect(el.getAttribute('role')).to.equal('gridcell');
    });
  });
});
