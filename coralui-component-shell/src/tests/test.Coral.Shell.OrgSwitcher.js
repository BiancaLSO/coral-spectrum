describe('Coral.Shell.OrgSwitcher', function() {
  describe('Namespace', function() {
    it('should be defined in the Coral.Shell namespace', function() {
      expect(Coral.Shell).to.have.property('OrgSwitcher');
      expect(Coral.Shell.OrgSwitcher).to.have.property('Footer');
      expect(Coral.Shell).to.have.property('Organization');
      expect(Coral.Shell).to.have.property('Suborganization');
    });
  });
  
  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      const el = helpers.build('<coral-shell-orgswitcher>');
      expect(el instanceof Coral.Shell.OrgSwitcher).to.equal(true);
    });
  
    it('should support creation from JavaScript', function() {
      var orgSwitcher = helpers.build(new Coral.Shell.OrgSwitcher());
    
      var organization1 = new Coral.Shell.Organization().set({
        'name': 'adobe'
      });
      organization1.content.innerHTML = 'Adobe';
    
      var orgElm = orgSwitcher.items.add(organization1);
    
      var subOrganization1 = new Coral.Shell.Suborganization().set({
        'name': 'adobejapan'
      });
      subOrganization1.content.innerHTML = 'Adobe Japan';
    
      var subOrgElm = orgElm.items.add(subOrganization1);
    
      var subOrganization2 = new Coral.Shell.Suborganization().set({
        'name': 'adobechina'
      });
      subOrganization2.content.innerHTML = 'Adobe China';
    
      orgElm.items.add(subOrganization2);
    
      var organization2 = new Coral.Shell.Organization().set({
        'name': 'adobeuse'
      });
      organization2.content.innerHTML = 'Adobe USA';
      
      orgSwitcher.items.add(organization2);
    
      expect(orgSwitcher.items.getAll().length).to.equal(4);
      expect(orgElm instanceof Coral.Shell.Organization).to.equal(true);
      expect(subOrgElm instanceof Coral.Shell.Suborganization).to.equal(true);
      expect(orgSwitcher.items.getAll().indexOf(organization1)).to.equal(0);
      expect(orgSwitcher.items.getAll().indexOf(subOrganization1)).to.equal(1);
      expect(orgSwitcher.items.getAll().indexOf(subOrganization2)).to.equal(2);
      expect(orgSwitcher.items.getAll().indexOf(organization2)).to.equal(3);
    });
  
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Shell.OrgSwitcher.subItems.html']);
    });
  
    it('should be possible to clone using js', function() {
      const el = new Coral.Shell.OrgSwitcher();
      const item = el.items.add();
      item.items.add();
      helpers.cloneComponent(el);
    });
  });
  
  describe('API', function() {});
  
  describe('Markup', function() {});
  
  describe('Events', function() {
    it('should trigger a change event when an item is selected', function() {
      const switcher = helpers.build(window.__html__['Coral.Shell.OrgSwitcher.items.html']);
      var spy = sinon.spy();
      switcher.on('coral-shell-orgswitcher:change', spy);

      var oldSelection = switcher.querySelector('[name="newsgator"]');
      var selection = switcher.querySelector('[name="flickr"]');

      // Select the new item
      selection.selected = true;

      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0].detail.selection).to.equal(selection);
      expect(spy.args[0][0].detail.oldSelection).to.equal(oldSelection);
    });

    it('should trigger a change event when a sub-item is selected', function() {
      const switcher = helpers.build(window.__html__['Coral.Shell.OrgSwitcher.subItems.html']);
      var spy = sinon.spy();
      switcher.on('coral-shell-orgswitcher:change', spy);

      var oldSelection = switcher.querySelector('[name="microsoftjapan"]');
      var selection = switcher.querySelector('[name="microsoftusa"]');

      // Select the new item
      selection.selected = true;

      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0].detail.selection).to.equal(selection);
      expect(spy.args[0][0].detail.oldSelection).to.equal(oldSelection);
    });
  });
  
  describe('Implementation Details', function() {
    var switcher;

    beforeEach(function() {
      switcher = helpers.build(new Coral.Shell.OrgSwitcher());
      createOrgItems(['Adobe', 'behance', 'Typekit']);
    });
    
    afterEach(function() {
      switcher = null;
    });

    it('should show exact matches', function() {
      searchAndCompareResults('behance', ['behance']);
    });

    it('should show partial matches', function() {
      searchAndCompareResults('ki', ['Typekit']);
    });

    it('should show all if multiple items match', function() {
      searchAndCompareResults('b', ['Adobe', 'behance']);
    });

    it('should be case insensitive', function() {
      searchAndCompareResults('AdObE', ['Adobe']);
    });

    function createOrgItems(orgNames) {
      orgNames.forEach(function(orgName) {
        switcher.items.add({
          content: {
            innerHTML: orgName
          }
        });
      });
    }

    function searchAndCompareResults(query, expectedResults) {
      switcher._elements.search.value = query;
      switcher.trigger('coral-search:input');
  
      var results = switcher.items.getAll()
        .filter(function(item) {
          return !item.hidden;
        })
        .map(function(item) {
          return item.content.textContent;
        });
  
      expect(results).to.deep.equal(expectedResults);
    }
  });
});
