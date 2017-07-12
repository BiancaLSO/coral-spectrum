describe('Coral.Checkbox', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Checkbox');
      expect(Coral.Checkbox).to.have.property('Label');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var checkbox = helpers.build(new Coral.Checkbox());
      
      ['disabled', 'readonly', 'invalid', 'required', 'checked'].forEach(function(attr) {
        expect(checkbox.hasAttribute(attr)).to.be.false;
      });
      expect(checkbox.classList.contains('coral3-Checkbox')).to.be.true;
      expect(helpers.classCount(checkbox)).to.equal(1);
    });

    it('should be possible to clone the element using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Checkbox.fromElement.html']);
    });

    it('should be possible to clone the element without label element using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Checkbox.withContent.html']);
    });

    it('should be possible to clone the element with label using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Checkbox.withLabel.html']);
    });

    it('should be possible to clone using js', function() {
      var el = new Coral.Checkbox();
      el.label.innerHTML = 'Test';
      helpers.cloneComponent(el);
    });
  });

  describe('Markup', function() {
    it('should be possible using markup', function() {
      const el = helpers.build('<coral-checkbox></coral-checkbox>');
      expect(el.classList.contains('coral3-Checkbox')).to.be.true;
    });

    it('should be possible using markup with text', function() {
      const el = helpers.build('<coral-checkbox>Checkbox</coral-checkbox>');
      expect(el.classList.contains('coral3-Checkbox')).to.be.true;
      expect(el.label.textContent).to.equal('Checkbox');
    });

    it('should be possible using markup with content zone', function() {
      const el = helpers.build('<coral-checkbox><coral-checkbox-label>Checkbox</coral-checkbox-label></coral-checkbox>');
      expect(el.classList.contains('coral3-Checkbox')).to.be.true;
      expect(el.label.textContent).to.equal('Checkbox');
    });
  });

  describe('API', function() {
    it('should have defaults', function() {
      var el = new Coral.Checkbox();

      expect(el.checked).to.be.false;
      expect(el.disabled).to.be.false;
      expect(el.name).to.equal('');
      expect(el.value).to.equal('on');
    });

    describe('#value', function() {
      it('should reflect value changes', function() {
        var checkbox = new Coral.Checkbox();
        checkbox.value = 'yes';
        expect(checkbox._elements.input.value).to.equal('yes');
      });
    });

    describe('#checked', function() {
      it('should reflect checked value', function() {
        var checkbox = new Coral.Checkbox();
        checkbox.checked = true;
        
        expect(checkbox.checked).to.be.true;
        expect(checkbox._elements.input.checked).to.be.true;
        expect(checkbox.hasAttribute('checked')).to.be.true;
      });

      it('should reflect unchecked value', function() {
        var checkbox = new Coral.Checkbox();
        checkbox.checked = false;
        
        expect(checkbox.checked).to.be.false;
        expect(checkbox._elements.input.checked).to.be.false;
        expect(checkbox.hasAttribute('checked')).to.be.false;
      });

      it('should handle manipulating checked attribute', function() {
        var el = new Coral.Checkbox();
        el.setAttribute('checked', '');
        
        expect(el._elements.input.checked).to.be.true;
        expect(el.checked).to.be.true;

        el.removeAttribute('checked');
        
        expect(el._elements.input.checked).to.be.false;
        expect(el.checked).to.be.false;
      });
    });

    describe('#indeterminate', function() {
      it('should reflect indeterminate value', function() {
        var checkbox = new Coral.Checkbox();
        expect(checkbox._elements.input.indeterminate).to.be.false;

        checkbox.indeterminate = true;
        
        expect(checkbox._elements.input.indeterminate).to.be.true;
        expect(checkbox._elements.input.hasAttribute('aria-checked', 'mixed')).to.be.true;
      });

      it('should not affect checked state when indeterminate state is changed', function() {
        var checkbox = new Coral.Checkbox();
        checkbox.checked = true;
        checkbox.indeterminate = true;
        
        expect(checkbox._elements.input.checked, 'when indeterminate is set').to.be.true;
        expect(checkbox.checked).to.be.true;
  
        checkbox.indeterminate = false;
        
        expect(checkbox._elements.input.checked, 'after indeterminate is changed to false').to.be.true;
        expect(checkbox.checked).to.be.true;
      });

      it('should not affect indeterminate state when checked state is changed', function() {
        var checkbox = new Coral.Checkbox();
        checkbox.indeterminate = true;
        checkbox.checked = true;
        
        expect(checkbox.indeterminate).to.be.true;
        expect(checkbox._elements.input.indeterminate, 'when checked is set').to.be.true;
  
        checkbox.checked = false;
  
        expect(checkbox.indeterminate).to.be.true;
        expect(checkbox._elements.input.indeterminate, 'after checked is changed to false').to.be.true;
      });

      it('should be removed on user interaction', function() {
        var checkbox = helpers.build(new Coral.Checkbox());
        checkbox.indeterminate = true;
        checkbox._elements.input.click();
  
        expect(checkbox.indeterminate).to.be.false;
        expect(checkbox._elements.input.indeterminate).to.be.false;
        expect(checkbox.checked).to.be.true;
        expect(checkbox.hasAttribute('checked')).to.be.true;
      });
    });

    describe('#disabled', function() {
      it('should reflect disabled value', function() {
        var el = new Coral.Checkbox();
        el.disabled = true;
        
        expect(el._elements.input.disabled).to.be.true;
      });

      it('should reflect enabled value', function() {
        var el = new Coral.Checkbox();
        el.disabled = false;
        
        expect(el._elements.input.disabled).to.be.false;
      });

      it('should handle manipulating disabled attribute', function() {
        var el = new Coral.Checkbox();
        el.setAttribute('disabled', '');
        
        expect(el._elements.input.disabled).to.be.true;
        expect(el.disabled).to.be.true;
  
        el.removeAttribute('disabled');
        
        expect(el._elements.input.disabled).to.be.false;
        expect(el.disabled).to.be.false;
      });
    });

    describe('#label', function() {
      it('should hide label by default', function() {
        var el = new Coral.Checkbox();
    
        expect(el._elements.labelWrapper.hidden).to.equal(true, 'The wrapper must be hidden since there are no contents');
      });
      
      it('should show label when content is not empty', function() {
        const el = helpers.build(window.__html__['Coral.Checkbox.withLabel.html']);
        expect(el._elements.labelWrapper.hidden).to.equal(false);
      });

      it('should hide label when content set to empty', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);
        
        expect(checkbox._elements.labelWrapper.hidden).to.equal(true);
        
        checkbox.label.innerHTML = 'Test';
        
        // Wait for MO
        helpers.next(() => {
          expect(checkbox._elements.labelWrapper.hidden).to.equal(false);
  
          checkbox.label.innerHTML = '';
          
          // Wait for MO
          helpers.next(() => {
            expect(checkbox._elements.labelWrapper.hidden).to.equal(true);
            done();
          });
        });
      });

      it('should hide label when content set to empty when not in DOM', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);
        checkbox.label.innerHTML = 'Test';

        // Wait for MO
        helpers.next(function() {
          expect(checkbox._elements.labelWrapper.hidden).to.equal(false);

          helpers.target.removeChild(checkbox);
          checkbox.label.innerHTML = '';

          // Wait for MO
          helpers.next(function() {
            helpers.target.appendChild(checkbox);

            // Wait for MO
            helpers.next(function() {
              expect(checkbox._elements.labelWrapper.hidden).to.equal(true);
              done();
            });
          });
        });
      });
    });

    describe('#rendering', function() {
      it('should render chechbox with only one input, checkbox, span and label element', function() {
        var checkbox = helpers.build(new Coral.Checkbox());
        
        expectCheckboxChildren();
      });

      it('should render clone of a checkbox with only one input, checkbox, span and label element', function() {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);

        helpers.target.appendChild(checkbox.cloneNode());

        helpers.target.removeChild(checkbox);
        
        expectCheckboxChildren();
      });

      function expectCheckboxChildren() {
        expect(helpers.target.querySelectorAll('coral-checkbox-label').length).to.equal(1);
        expect(helpers.target.querySelectorAll('input[handle="input"]').length).to.equal(1);
        expect(helpers.target.querySelectorAll('span[handle="checkbox"]').length).to.equal(1);
        expect(helpers.target.querySelectorAll('label[handle="labelWrapper"]').length).to.equal(1);
      }
    });

  });

  describe('events', function() {
    var checkbox;
    var changeSpy;
    var preventSpy;

    beforeEach(function() {
      changeSpy = sinon.spy();
      preventSpy = sinon.spy();

      checkbox = helpers.build(new Coral.Checkbox());

      // changeSpy and preventSpy for event bubble
      Coral.events.on('change', function(event) {

        // target must always be the switch and not the input
        expect(event.target.tagName).to.equal('CORAL-CHECKBOX');

        changeSpy();

        if (event.defaultPrevented) {
          preventSpy();
        }
      });

      expect(changeSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      Coral.events.off('change');
    });

    it('should trigger change on click', function() {
      checkbox._elements.input.click();
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(1);
      expect(checkbox.checked).to.be.true;
      expect(checkbox.hasAttribute('checked')).to.be.true;
    });

    it('should trigger change on indeterminate set', function() {
      checkbox.indeterminate = true;

      expect(checkbox.indeterminate).to.be.true;
      expect(checkbox.checked).to.be.false;

      checkbox._elements.input.click();
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(1);
      expect(checkbox.checked).to.be.true;
      expect(checkbox.indeterminate).to.be.false;
      expect(checkbox.hasAttribute('checked')).to.be.true;
    });

    it('should not trigger change event, when checked property', function() {
      checkbox.checked = true;
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(0);
    });

    it('should trigger change event, when clicked', function() {
      expect(checkbox.checked).to.be.false;
      checkbox._elements.input.click();
      
      expect(checkbox.checked).to.be.true;
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(1);
    });

    it('should not trigger change event if value changed', function() {
      checkbox.value = 'value';
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(0);
    });
  });

  describe('in a form', function() {

    var checkbox;

    beforeEach(function() {
      var form = document.createElement('form');
      form.id = 'testForm';
      helpers.target.appendChild(form);

      checkbox = new Coral.Checkbox();
      checkbox.name = 'formCheckbox';
      form.appendChild(checkbox);
    });

    it('should include the internal input value when checked', function() {
      checkbox.checked = true;
      expectFormSubmitContentToEqual([{name:'formCheckbox', value: 'on'}]);
    });

    it('should not include the internal input value when not checked', function() {
      // default is not checked
      expectFormSubmitContentToEqual([]);
    });

    it('should not include the internal input value when not named', function() {
      checkbox.name = '';
      expectFormSubmitContentToEqual([]);
    });

    it('should include the new value if the value was changed', function() {
      checkbox.value = 'kittens';
      checkbox.checked = true;
      expectFormSubmitContentToEqual([{name:'formCheckbox', value: 'kittens'}]);
    });

    function expectFormSubmitContentToEqual(expectedValue) {
      var form = document.getElementById('testForm');
      expect(helpers.serializeArray(form)).to.deep.equal(expectedValue);
    }
  });

  describe('Implementation Details', function() {

    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.Checkbox.fromElement.html'], {
        value: 'on',
        default: 'on'
      });
    });

    it('should allow replacing the content zone', function(done) {
      var el = helpers.build(new Coral.Checkbox());

      var label = new Coral.Checkbox.Label();
      label.textContent = 'Content';

      // Wait for MO
      helpers.next(function() {
        expect(el._elements.labelWrapper.hidden).to.be.true;
        el.label = label;
  
        // Wait for MO
        helpers.next(function() {
          expect(el._elements.labelWrapper.hidden).to.be.false;

          done();
        });
      });
    });

    it('should support click()', function() {
      var el = new Coral.Checkbox();
      var changeSpy = sinon.spy();
      el.on('change', changeSpy);
      el.click();
      expect(el.checked).to.be.true;
      expect(changeSpy.callCount).to.equal(1);
      el.click();
      expect(el.checked).to.be.false;
      expect(changeSpy.callCount).to.equal(2);
      el.indeterminate = true;
      el.click();
      expect(el.checked).to.be.true;
      expect(el.indeterminate).to.be.false;
      expect(changeSpy.callCount).to.equal(3);
      el.indeterminate = true;
      el.click();
      expect(el.checked).to.be.false;
      expect(el.indeterminate).to.be.false;
      expect(changeSpy.callCount).to.equal(4);
    });
  });
});
