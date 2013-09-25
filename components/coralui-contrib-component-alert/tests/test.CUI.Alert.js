describe('CUI.Alert', function() {
  
  var clickClose = function(target) {
    if (window._phantom) {
      target.trigger('tap');
    } else {
      target.trigger('click');
    }
  };

  it('should be defined in CUI namespace', function() {
    expect(CUI).to.have.property('Alert');
  });

  it('should be defined on jQuery object', function() {
    var div = $('<div/>');
    expect(div).to.have.property('alert');
  });

  describe("from markup", function() {
    var html, el;

    beforeEach(function() {
      html = 
      '<div class="alert error">' +
      '<button class="close" data-dismiss="alert">&times;</button>' +
      '<strong>ERROR</strong><div>Uh oh, something went wrong with the whozit!</div>' +
      '</div>';

      el = $(html).appendTo('body');
    });

    it('should hide when dismissed', function() {
      expect(el).to.have.css('display', 'block');
      clickClose(el.find('button'));
      expect(el).to.have.css('display', 'none');
    });

    it('should not submit a form when dismissed', function() {
      var form = $('<form />'), spy = sinon.spy();
      el.wrap(form);
      form.on('submit', spy);
      expect(spy.called).to.be(false);
      clickClose(el.find('button'));
      expect(spy.called).to.be(false);
    });

  }); // /from markup   

  describe("from template", function(){
    var html, el;

    beforeEach(function() {
      html = '<div id="myAlert"></div>';
      el = $(html).appendTo('body');
    });

    it('should add \'alert\' class to element', function() {
      el.alert();
      expect(el).to.have.class('alert');
    });

    it('should add \'error\' class to element by default', function() {
      el.alert();
      expect(el).to.have.class('error');
      expect(el).to.not.have.class('help');
      expect(el).to.not.have.class('notice');
      expect(el).to.not.have.class('success');
    });

    it('should support \'notice\' class as type parameter', function() {
      el.alert({type:'notice'});
      expect(el).to.have.class('notice');
      expect(el).to.not.have.class('help');
      expect(el).to.not.have.class('error');
      expect(el).to.not.have.class('success');
    });

    it('should support \'success\' class as type parameter', function() {
      el.alert({type:'success'});
      expect(el).to.have.class('success');
      expect(el).to.not.have.class('help');
      expect(el).to.not.have.class('error');
      expect(el).to.not.have.class('notice');
    });

    it('should support \'help\' class as type parameter', function() {
      el.alert({type:'help'});
      expect(el).to.have.class('help');
      expect(el).to.not.have.class('notice');
      expect(el).to.not.have.class('error');
      expect(el).to.not.have.class('success');
    });

    it('should ignore \'somethingNotSupported\' as type parameter', function() {
      el.alert({type:'somethingNotSupported'});
      expect(el).to.have.class('error');
      expect(el).to.not.have.class('help');
      expect(el).to.not.have.class('notice');
      expect(el).to.not.have.class('success');
    });

    it('should ignore non-string value as type parameter', function() {
      el.alert({type: 0});
      expect(el).to.have.class('error');
      expect(el).to.not.have.class('help');
      expect(el).to.not.have.class('notice');
      expect(el).to.not.have.class('success');
    });

    it('should set heading to type in strong uppercase by default', function() {
      el.alert({type: 'notice'});
      expect(el).to.have.class('notice');
      var heading = el.find('strong');
      expect(heading.html()).to.equal("NOTICE");
    });

    it('should set heading to parameter value if specified', function() {
      el.alert({type: 'notice', heading:'Not Notice'});
      expect(el).to.have.class('notice');
      var heading = el.find('strong');
      expect(heading.html()).to.equal("Not Notice");
    });

    it('should have no content if none is specified', function() {
      el.alert();
      var content = el.find('div');
      expect(content.html()).to.equal('');
    });

    it('should wrap content in div if parameter is specified', function() {
      var EXPECTED_CONTENT = 'some expected content';
      el.alert({content:EXPECTED_CONTENT});
      var content = el.find('div');
      expect(content.html()).to.equal(EXPECTED_CONTENT);
    });

    it('should include a close button by default', function() {
      el.alert();
      var button = el.find('button');
      expect(button).to.have.class('close');
      expect(button.html()).to.equal('×'); // ascii-158, aka 'times'
    });

    it('should include a close button of closable set to true', function() {
      el.alert({closeable:true});
      var button = el.find('button');
      expect(button).to.have.class('close');
      expect(button.html()).to.equal('×'); // ascii-158, aka 'times'
    });

    it('should set close button display none if closable set to false', function() {
      el.alert({closable:false});
      var button = el.find('button');
      expect(button).to.have.class('close');
      expect(button).to.have.css('display', 'none');
    });

  }); // /from template

}); // /CUI.Alert