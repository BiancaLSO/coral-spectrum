# Styles

## Theme


The default CoralUI font styles cascade from `coral--light` or `coral--dark` theme, so that class must be specified at a higher level.

```
<body class="coral--light">
    <!-- light theme -->
    <div class="container"></div>
    <div class="coral--dark">
        <!-- dark theme -->
    </div>
</body>
```

## CSS only components

**This section provides details on the few CSS-only components included in CoralUI considered as public API.**

There are some CoralUI components that are markup and CSS only. They are not custom elements, and as such are used by 
setting CSS selectors on normal HTML markup. 

### coral-DecoratedTextfield

Renders a textfield with an embedded button, icon, or both.
 
#### Icon Only

```
<span class="coral-DecoratedTextfield">
  <coral-icon class="coral-DecoratedTextfield-icon" icon="search" size="XS"></coral-icon>
  <input is="coral-textfield" class="coral-DecoratedTextfield-input">
</span>
```

#### Button Only
 
```
<span class="coral-DecoratedTextfield">
  <input is="coral-textfield" class="coral-DecoratedTextfield-input">
  <button is="coral-button" variant="minimal" icon="close" iconsize="XS" class="coral-DecoratedTextfield-button"></button>
</span>
``` 

#### Icon and Button

```
<span class="coral-DecoratedTextfield">
  <coral-icon class="coral-DecoratedTextfield-icon" icon="search" size="XS"></coral-icon>
  <input is="coral-textfield" class="coral-DecoratedTextfield-input">
  <button is="coral-button" variant="minimal" icon="close" iconsize="XS" class="coral-DecoratedTextfield-button"></button>
</span>
```

### coral-Heading

Headings are used to represent titles in content. 

```
<h1 class="coral-Heading coral-Heading--1">Heading 1</h1>
<h2 class="coral-Heading coral-Heading--2">Heading 2</h2>
<h3 class="coral-Heading coral-Heading--3">Heading 3</h3>
<h4 class="coral-Heading coral-Heading--4">Heading 4</h4>
<h5 class="coral-Heading coral-Heading--5">Heading 5</h5>
<h6 class="coral-Heading coral-Heading--6">Heading 6</h6>
```

### coral-InputGroup

A composite CSS pattern for Buttons and Textfields.

#### Button before

```
<div class="coral-InputGroup">
  <span class="coral-InputGroup-button">
    <button is="coral-button" icon="select" title="Select"></button>
  </span>
  <input is="coral-textfield" class="coral-InputGroup-input">
</div>
```

#### Button after

```
<div class="coral-InputGroup">
  <input is="coral-textfield" class="coral-InputGroup-input">
  <span class="coral-InputGroup-button">
    <button is="coral-button" icon="select" title="Select"></button>
  </span>
</div>
```

#### Icon Buttons on both sides

```
<div class="coral-InputGroup">
  <span class="coral-InputGroup-button">
    <button is="coral-button" icon="minus" title="Minus"></button>
  </span>
  <input is="coral-textfield" class="coral-InputGroup-input">
  <span class="coral-InputGroup-button">
    <button is="coral-button" icon="add" title="Add"></button>
  </span>
</div>
```

#### Text Buttons on both side
 
```
<div class="coral-InputGroup">
  <span class="coral-InputGroup-button">
    <button is="coral-button">Go!</button>
  </span>
  <input is="coral-textfield" class="coral-InputGroup-input">
  <span class="coral-InputGroup-button">
    <button is="coral-button">Go!</button>
  </span>
</div>
```

#### Block with Button before

```
<div class="coral-InputGroup coral-InputGroup--block">
  <span class="coral-InputGroup-button">
    <button is="coral-button" icon="select" title="Select"></button>
  </span>
  <input is="coral-textfield" class="coral-InputGroup-input">
</div>
```

#### Block with Button after

```
<div class="coral-InputGroup coral-InputGroup--block">
  <input is="coral-textfield" class="coral-InputGroup-input">
  <span class="coral-InputGroup-button">
    <button is="coral-button" icon="select" title="Select"></button>
  </span>
</div>
```

#### Block with text Buttons and both sides

```
<div class="coral-InputGroup coral-InputGroup--block">
  <span class="coral-InputGroup-button">
    <button is="coral-button">Go!</button>
  </span>
  <input is="coral-textfield" class="coral-InputGroup-input">
  <span class="coral-InputGroup-button">
    <button is="coral-button">Go!</button>
  </span>
</div>
```

#### Block with Icons Buttons on both sides

```
<div class="coral-InputGroup coral-InputGroup--block">
  <span class="coral-InputGroup-button">
    <button is="coral-button" icon="minus" title="Minus"></button>
  </span>
  <input is="coral-textfield" class="coral-InputGroup-input">
  <span class="coral-InputGroup-button">
    <button is="coral-button" icon="add" title="Add"></button>
  </span>
</div>
```

### coral-Form

Form styles. Please look at the related components, to see more examples.

#### Vertical Layout

Add the `coral-Form--vertical` class to render all labels and fields on the same vertical line.

```
<form class="coral-Form coral-Form--vertical">
  <section class="coral-Form-fieldset">
  <label class="coral-Form-fieldlabel">Text</label>
  <span class="coral-Form-field">Read only text</span>
  <div class="coral-Form-fieldwrapper">
    <label class="coral-Form-fieldlabel">Text (with coral-Form-fieldinfo)</label>
    <span class="coral-Form-field">Read only text</span>
    <coral-icon id="coral-Form-Aligned-Text-required" class="coral-Form-fieldinfo" icon="infoCircle"></coral-icon>
    <coral-tooltip variant="info" placement="right" target="#coral-Form-Vertical-Text-required">Tooltip Information</coral-tooltip>
  </div>
  <label class="coral-Form-fieldlabel">Aligning buttons left</label>
  <div class="coral-Form-fieldwrapper coral-Form-fieldwrapper--alignLeft">
    <button is="coral-button" class="coral-Form-field" type="button">Cancel</button>
    <button is="coral-button" variant="primary" class="coral-Form-field">Submit</button>
  </div>
</section>
</form>
```

#### Aligned Layout

Add the `coral-Form--aligned` class to render each label and field pair on the same horizontal line.

```
<form class="coral-Form coral-Form--aligned">
  <section class="coral-Form-fieldset">
  <label class="coral-Form-fieldlabel">Text</label>
  <span class="coral-Form-field">Read only text</span>
  <div class="coral-Form-fieldwrapper">
    <label class="coral-Form-fieldlabel">Text</label>
    <span class="coral-Form-field">Read only text</span>
    <coral-icon id="coral-Form-Aligned-Text-required" class="coral-Form-fieldinfo" icon="infoCircle"></coral-icon>
    <coral-tooltip variant="info" placement="right" target="#coral-Form-Aligned-Text-required">Tooltip Information</coral-tooltip>
  </div>
</section>
</form>
```

### coral-Link

Links get styled using the `coral-Link` class.

#### Regular

```
<a href="#" class="coral-Link">link</a>.
```

#### Subtle

```
<a href="#" class="coral-Link coral-Link--subtle">subtle link</a>
```

### coral-RadioGroup

Aligns Radio components.

#### Horizontal

```
<div class="coral-RadioGroup">
  <label class="coral-Radio">
    <coral-radio name="r1">Quack Quack</coral-radio>
  </label>
  <label class="coral-Radio">
    <coral-radio name="r1">Woof Woof</coral-radio>
  </label>
  <label class="coral-Radio">
    <coral-radio name="r1">Meow Meow</coral-radio>
  </label>
</div>
```

#### Vertical

```
<div class="coral-RadioGroup coral-RadioGroup--vertical">
  <label class="coral-Radio">
    <coral-radio name="r1">Quack Quack</coral-radio>
  </label>
  <label class="coral-Radio">
    <coral-radio name="r1">Woof Woof</coral-radio>
  </label>
  <label class="coral-Radio">
    <coral-radio name="r1">Meow Meow</coral-radio>
  </label>
</div>
```

#### Labels below

```
<div class="coral-RadioGroup coral-RadioGroup--labelsBelow">
  <label class="coral-Radio">
    <coral-radio name="r1">1</coral-radio>
  </label>
  <label class="coral-Radio">
    <coral-radio name="r1">2</coral-radio>
  </label>
  <label class="coral-Radio">
    <coral-radio name="r1">3</coral-radio>
  </label>
</div>
```

### coral-Table 

#### Basic

```
<table class="coral-Table">
  <thead class="coral-Table-head">
    <tr class="coral-Table-row">
      <th class="coral-Table-headerCell">Pet Name</th>
      <th class="coral-Table-headerCell">Type</th>
      <th class="coral-Table-headerCell">Good/Bad</th>
    </tr>
  </thead>
  <tbody class="coral-Table-body">
    <tr class="coral-Table-row">
      <td class="coral-Table-cell">Squeak</td>
      <td class="coral-Table-cell">Mouse</td>
      <td class="coral-Table-cell">Bad</td>
    </tr>
    <tr class="coral-Table-row">
      <td class="coral-Table-cell">Spot</td>
      <td class="coral-Table-cell">Dog</td>
      <td class="coral-Table-cell">Bad</td>
    </tr>
    <tr class="coral-Table-row">
      <td class="coral-Table-cell">Fluffy</td>
      <td class="coral-Table-cell">Velociraptor</td>
      <td class="coral-Table-cell">Good</td>
    </tr>
  </tbody>
</table>
```

#### Row hover

```
<table class="coral-Table coral-Table--hover">
  <thead class="coral-Table-head">
    <tr class="coral-Table-row">
      <th class="coral-Table-headerCell">Pet Name</th>
      <th class="coral-Table-headerCell">Type</th>
      <th class="coral-Table-headerCell">Good/Bad</th>
    </tr>
  </thead>
  <tbody class="coral-Table-body">
    <tr class="coral-Table-row">
      <td class="coral-Table-cell">Mongo</td>
      <td class="coral-Table-cell">Chihuahua</td>
      <td class="coral-Table-cell">Bad</td>
    </tr>
    <tr class="coral-Table-row">
      <td class="coral-Table-cell">Tiny</td>
      <td class="coral-Table-cell">Great Dane</td>
      <td class="coral-Table-cell">Bad</td>
    </tr>
    <tr class="coral-Table-row">
      <td class="coral-Table-cell">Jaws</td>
      <td class="coral-Table-cell">Pit Bull</td>
      <td class="coral-Table-cell">Good</td>
    </tr>
  </tbody>
</table>
```

#### Bordered

```
<table class="coral-Table coral-Table--bordered">
  <thead class="coral-Table-head">
    <tr class="coral-Table-row">
      <th class="coral-Table-headerCell">Pet Name</th>
      <th class="coral-Table-headerCell">Type</th>
      <th class="coral-Table-headerCell">Good/Bad</th>
    </tr>
  </thead>
  <tbody class="coral-Table-body">
    <tr class="coral-Table-row">
      <td class="coral-Table-cell">Hopper</td>
      <td class="coral-Table-cell">Frog</td>
      <td class="coral-Table-cell">Good</td>
    </tr>
    <tr class="coral-Table-row">
      <td class="coral-Table-cell">Pokey</td>
      <td class="coral-Table-cell">Porcupine</td>
      <td class="coral-Table-cell">Good</td>
    </tr>
    <tr class="coral-Table-row">
      <td class="coral-Table-cell">Mr. Snuggles</td>
      <td class="coral-Table-cell">Snake</td>
      <td class="coral-Table-cell">Bad</td>
    </tr>
  </tbody>
</table>
```

### coral-Well

Wells are used to separate field groups or large blocks of text.

```
<div class="coral-Well">
    Lorem ipsum Fugiat sit mollit incididunt in occaecat reprehenderit cillum
    magna Excepteur enim eu deserunt eiusmod dolor occaecat dolore officia mollit
    dolore consectetur elit in enim esse consectetur amet do exercitation..
  </div>
```

### u-coral

CoralUI provides some CSS utility classes that can be applied to any DOM element.

#### u-coral-clearFix

Applies the clearfix hack.

#### u-coral-noBorder

Removes all the borders of an element.

#### u-coral-noScroll

Stops an element from scrolling.

#### u-coral-screenReaderOnly

Hides elements from visual browsers.

#### u-coral-closedHand

A closed hand cursor that indicates an item is current grabbed.

#### u-coral-openHand

An open hand cursor to indicate that an item can be grabbed.

#### u-coral-pullLeft

Floats the content to the left.

#### u-coral-pullRight

Floats the content to the right.

#### u-coral-padding

Adds the default padding on all sides.

#### u-coral-padding-horizontal

Adds the default padding to left and right.

#### u-coral-padding-vertical

Adds the default padding to top and bottom.

#### u-coral-margin

Adds the default the margin on all sides.

#### u-coral-noPadding

Removes the padding on all sides.

#### u-coral-noPadding-horizontal

Removes the padding on the left and right side.

#### u-coral-noPadding-vertical

Removes the padding on the top and bottom side.

#### u-coral-noMargin

Removes the margin on all sides.

#### u-coral-ellipsis

Prevent text from wrapping, use an ellipsis to truncate.

#### u-coral-visibleXS | u-coral-hiddenXS 

Extra small device: <768px.

#### u-coral-visibleS | u-coral-hiddenS

Small device: >= 768px.

#### u-coral-visibleM | u-coral-hiddenM

Medium device: >= 992px.

#### u-coral-visibleL | u-coral-hiddenL

Large device >= 1200px.

## Using Typekit

CoralUI uses Typekit to securely deliver the Adobe Clean corporate font.

### Domains

It comes pre-configured with a kit that is limited to the following domains :

* *.adobe.com
* *.demdex.com
* *.acrobat.com
* *.omniture.com
* *.day.com
* localhost
* 127.0.0.1
* 0.0.0.0

If you are using CoralUI on a server on a domain other than these, you will need to request and configure your own Typekit kit.

### Requesting a Kit for Additional Domains

If you need to enable CoralUI on additional domains, you will need to obtain a voucher for Adobe Clean from the Typekit team.

1. Create a [generic Adobe account](https://inside.corp.adobe.com/itech/kc/KB1312968.html) to use as your Typekit account. (recommended)
2. Visit [Adobe TypeKit Wiki](https://wiki.corp.adobe.com/display/devrel/Using+Typekit+at+Adobe) for further help on Adobe TypeKit accounts.
3. Configure your kit per the Kit Configuration settings below.
4. Configure CoralUI to use your default kit per the instructions below.

### Kit configuration

Your Kit should be configured with following font variations included.

```
Adobe Clean - Light
Adobe Clean - Regular
Adobe Clean - Bold
Adobe Clean - Italic
Adobe Clean Condensed - Bold
Adobe Clean Condensed - Italic
```

Choose default language support for both families.

### Using a Custom Kit with CoralUI

Include your Typekit ID as a CoralUI option before CoralUI gets loaded.

```
<script>
  window.Coral = window.Coral || {};
  Coral.options = { typeKitId: 'xwm7izk'};
</script>
```

### Font loading

Typekit typically relies on a `.wf-loading` selector to hide content and prevent the Flash Of Unstyled Text (FOUT) that 
is associated with web fonts.

```
.wf-loading {
  visibility: hidden;
}
```

That selector would work in conjunction with the function in the typekit.js JavaScript file to remove the selector from 
the DOM when Typekit has loaded. However, experience has shown that hiding content and blocking until Typekit loads can 
make the page or app unresponsive on initial load.

CoralUI remains agnostic. Consumers must implement their own solution to avoid Flash Of Unstyled Text during font loading.

