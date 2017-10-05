describe('Coral.Search', function() {
  function testInstance(instance) {
    expect(instance.classList.contains('coral-DecoratedTextfield')).to.be.true;
    expect(instance.classList.contains('coral3-Search')).to.be.true;
    expect(instance._elements.input).to.exist;
    expect(instance.getAttribute('icon')).to.equal('search');
    expect(instance.hasAttribute('disabled')).to.be.false;
    expect(instance.hasAttribute('invalid')).to.be.false;
    expect(instance.hasAttribute('name')).to.be.false;
    expect(instance.hasAttribute('required')).to.be.false;
    expect(instance.hasAttribute('placeholder')).to.be.false;
    expect(instance.hasAttribute('value')).to.be.false;
  }

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Search');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var ni = helpers.build(new Coral.Search());
      testInstance(ni);
    });

    it('should be possible using createElement', function() {
      var ni = helpers.build(document.createElement('coral-search'));
      testInstance(ni);
    });

    it('should be possible using markup', function() {
      var ni = helpers.build('<coral-search></coral-search>');
      testInstance(ni);
    });
  
    it('should be possible to clone the element using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Search.html']);
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Coral.Search());
    });
  });

  describe('API', function() {
    var el;
    beforeEach(function() {
      el = new Coral.Search();
    });

    afterEach(function() {
      el = null;
    });

    describe('#icon', function() {
      it('should default to "search"', function() {
        expect(el.icon).to.equal('search');
      });

      it('should set icon', function() {
        el.icon = 'launch';
        expect(el._elements.icon.icon).to.equal('launch');
      });

      it('should hide icon when not set', function() {
        el.icon = '';
        expect(el._elements.icon.hidden).to.equal(true);
      });
    });

    describe('#variant', function() {
      it('should default to "default', function() {
        expect(el.variant).to.equal(Coral.Search.variant.DEFAULT);
        expect(el._elements.input.variant).to.equal(Coral.Search.variant.DEFAULT);
      });

      it('should set the variant', function() {
        el.variant = Coral.Search.variant.QUIET;
        expect(el.variant).to.be.equal(Coral.Search.variant.QUIET);
        expect(el._elements.input.variant).to.equal(Coral.Search.variant.QUIET);
      });

      // this test should fail in case the variant values of the textfield stop matching the ones that the search has
      it('should match the internal variant values', function() {
        expect(Coral.Search.variant.QUIET).to.equal(Coral.Textfield.variant.QUIET);
        expect(Coral.Search.variant.DEFAULT).to.equal(Coral.Textfield.variant.DEFAULT);
      });
    });
  
    describe('#maxlength', function() {
      it('should return maxlength from the input', function() {
        expect(el.maxLength).to.equal(-1);
        expect(el.hasAttribute('maxlength')).to.be.false;
      });
      
      it('should set field maxlength to 10', function() {
        el.maxLength = 10;
        expect(el._elements.input.getAttribute('maxlength')).to.equal('10');
        expect(el.getAttribute('maxlength')).to.equal('10');
      });
    });
  });

  describe('clearInput', function() {
    it('should clear text value', function() {
      var instance = helpers.build(new Coral.Search());
      instance._elements.input.value = 'dummy text';
      instance._clearInput();
      expect(instance._elements.input.value).to.equal('');
    });
  });
  
  it('should submit the one single value', function() {
    var el = new Coral.Search();
    // we wrap first the select
    var form = document.createElement('form');
    form.appendChild(el);
    helpers.target.appendChild(form);
    
    el.name = 'search';
    el._elements.input.value = 'dummy text';
    
    expect(helpers.serializeArray(form)).to.deep.equal([{
      name: 'search',
      value: 'dummy text'
    }]);
  });
});
