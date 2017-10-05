describe('Coral.Table.Column', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('Column');
    });
    
    it('should expose enums', function() {
      expect(Coral.Table.Column).to.have.property('sortableType');
      expect(Coral.Table.Column).to.have.property('sortableDirection');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      const el = helpers.build(new Coral.Table.Column());
      expect(el.classList.contains('coral-Table-column')).to.be.true;
    });
    
    it('should be possible using document.createElement', function() {
      const el = helpers.build(document.createElement('col', {is: 'coral-table-column'}));
      expect(el.classList.contains('coral-Table-column')).to.be.true;
    });
  });
  
  describe('API', function() {
    describe('#fixedWidth', function() {});
  
    describe('#hidden', function() {});
  
    describe('#orderable', function() {});
  
    describe('#sortable', function() {});
  
    describe('#sortableType', function() {
      it('should default to sortableType.ALPHANUMERIC', function() {
        const el = new Coral.Table.Column();
        expect(el.sortableType).to.equal(Coral.Table.Column.sortableType.ALPHANUMERIC);
      });
    });
  
    describe('#sortableDirection', function() {
      it('should default to sortableDirection.DEFAULT', function() {
        const el = new Coral.Table.Column();
        expect(el.sortableDirection).to.equal(Coral.Table.Column.sortableDirection.DEFAULT);
      });
    });
  });
  
  describe('Events', function() {
    let el = null;
    let spy = null;
    
    beforeEach(function() {
      el = new Coral.Table.Column();
      spy = sinon.spy();
    });
    
    afterEach(function() {
      el = null;
      spy = null;
    });
    
    describe('#coral-table-column:_fixedwidthchanged', function() {
      it('should trigger when changing fixedWidth', function() {
        el.on('coral-table-column:_fixedwidthchanged', spy);
        el.fixedWidth = true;
        
        expect(spy.callCount).to.equal(1);
      });
    });
    
    describe('#coral-table-column:_hiddenchanged', function() {
      it('should trigger when changing hidden', function() {
        el.on('coral-table-column:_hiddenchanged', spy);
        el.hidden = true;
        
        expect(spy.callCount).to.equal(1);
      });
    });
    
    describe('#coral-table-column:_orderablechanged', function() {
      it('should trigger when changing orderable', function(done) {
        el.on('coral-table-column:_orderablechanged', spy);
        el.orderable = true;
  
        // Event is triggered in next frame
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
    
    describe('#coral-table-column:_sortablechanged', function() {
      it('should trigger when changing sortable', function(done) {
        el.on('coral-table-column:_sortablechanged', spy);
        el.sortable = true;
  
        // Event is triggered in next frame
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
    
    describe('#coral-table-column:_sortabledirectionchanged', function() {
      it('should trigger when changing sortableDirection', function() {
        el.on('coral-table-column:_sortabledirectionchanged', spy);
        el.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
        
        expect(spy.callCount).to.equal(1);
      });
    });
    
    describe('#coral-table-column:_sort', function() {
      it('should trigger when changing sortableDirection', function() {
        el.on('coral-table-column:_sort', spy);
        el.sortableDirection = Coral.Table.Column.sortableDirection.ASCENDING;
  
        expect(spy.callCount).to.equal(1);
      });
    });
  });
});
