# Welcome to The Grid!


## What is it?
he Grid is an ultra light weight (5.3 Kb) jQuery plugin that displays your cells in a surely nice grid layout way.
Cells may have different dimensions but The Grid will rearrange the order to avoid the blanks.


## How does it work?
It works with units. Each cell has a dimension given in units like 1, 2, 3 units per width and/or height.

1. The Grid will internally place the cells you provide in your HTML inside a matrix to check for the empty spaces.
2. Once the calculation is done The Grid will render the cells at the best position with absolute coordinates.
The absolute positioning will allow The Grid to animate the moves of the cells when sorting, filtering, or changing breakpoint.



## Install
Clone from GitHub or download zip archive.

    cd [where_you_want_it_to_be]
    git clone git@github.com:antoniandre/grid.git


## Get it working
### 1. Include dependencies
Install dependencies from _Bower_.

    bower install

Then make sure you include jQuery script and grid script + minimum style in document `<head>`:

```HTML
<link rel="stylesheet" type="text/css" href="../css/grid.css">
<script src="../bower_components/jquery/dist/jquery.min.js"></script>
<script src="../js/grid.js"></script>
```


### 2. Instantiate The Grid
Then use the most basic instantiation to get The Grid running!

__HTML__

```HTML
<div class="thegrid">
    <div class="cell" data-width="1" data-height="4"><div data-text="1"></div></div>
    <div class="cell" data-width="1" data-height="1"><div data-text="2"></div></div>
    <div class="cell" data-width="3" data-height="1"><div data-text="3"></div></div>
    <div class="cell" data-width="5" data-height="1"><div data-text="4"></div></div>
    <div class="cell" data-width="2" data-height="1"><div data-text="5"></div></div>
    <div class="cell" data-width="2" data-height="1"><div data-text="6"></div></div>
    <div class="cell" data-width="2" data-height="1"><div data-text="7"></div></div>
    <div class="cell" data-width="1" data-height="3"><div data-text="8"></div></div>
    <div class="cell" data-width="1" data-height="2"><div data-text="9"></div></div>
    <div class="cell" data-width="1" data-height="1"><div data-text="10"></div></div>
</div>
```

__CSS__

```CSS
* {margin: 0;padding: 0;font-family: sans-serif;}
.thegrid .cell {padding: 1%;}
.thegrid .cell > div {
    background-image: radial-gradient(circle at top right,#f33,pink);
    display: -ms-flex;
    display: flex;
    align-items: center;
}
.cell div:after {
    content: attr(data-text);
    display: block;
    text-align: center;
    width: 100%;
    color: rgba(255,255,255,.25);
    font-size: 200%;
}
```

__JS__

```Javascript
$('.thegrid').grid();

// Alternatively you can call it this way:
// var grid1 = new thegrid();
// Then you can access grid methods like:
// grid1.redraw();
```

Hum. I can already guess that it won't be enough to suit your picky needs, so you'd better add a few parameters.



## Settings - TO BE UPDATED SOON
You can use all these settings

```Javascript
{
    grid: $('.thegrid'),// The container of the cells.
    cells: $('.cell'),// The cells to render / place / filter.
    cellsPerRow: 7,
    cellHeight: 100,// Cell height in pixels.
                    // You can also define a function like so:
                    // function(gh){return ((gh.gridWidth / gh.options.cellsPerRow) * 262 / 400) + 100};
                    // But be aware that it will be much more costy (you may opt for throttling).

    // Animations.
    // By default the cells animation will be handled via CSS transitions as it is known to be smoother and
    // of better performances. however if you want some fancy easing effects (e.g. elastic or bounce) you may
    // want to switch to javascript animations. If so just turn animationPlatform to 'js' and provide the easing
    // speed and curve that you want.
    // You can also override the default CSS transitions in a custom CSS like:
    // .thegrid.transitions .cell {
    //     -webkit-transition: .3s ease-in-out;
    //     -o-transition: .3s ease-in-out;
    //     transition: .3s ease-in-out;
    // }
    animationPlatform: 'css',// 'css' or 'js'.
    animationSpeed: 500,
    animationEasing: 'linear',
    animationDelay: 0,

    updateGridHeight: true,// On each render.

    // Responsiveness.
    // Only if breakpoints are set the redraw() function is triggered on each resize event.
    // You can throttle the redraw to alight the resizing event.
    // (while resizing the redraw() function is exec every throttlingDelay milliseconds)
    throttling: false,
    throttlingDelay: 300,// in ms.
    /* Breakpoints (from desktop to mobile) to have a different behavior according to the device screen width.
    Example of use:
    breakpoints:
    {
        1199:
        {
            cellsPerRow: 5
        },
        767:
        {
            cellsPerRow: 4
        },
        479:
        {
            cellsPerRow: 3
        },
    }*/
    breakpoints: {}
}
```

## Methods - TO BE UPDATED SOON
You can use all these methods

### Redraw
This is the most useful method of all. You will have to call it every time you made a change to the grid configuration or grid cells collection.
As easy to use as:

```Javascript
thegrid.redraw();
```

This function is not internally called from each function like .filter() or updateParams() for better performance.<br>So you can chain multiple changes and redraw only once.

### updateParams

```Javascript
$('.thegrid').grid('updateParams', params);

// Alternatively you can do it this way (after var grid1 = new thegrid();):
// grid1.updateParams(params);`
```

### Filter

To filter the cells you can call the `.filter()` method with the collection of cells you want to show or hide.

```Javascript
$('.thegrid').grid('filter', cellsToToggle [, hide = false] [, toggleAllOthers = false]);
```

__@param__ `cellsToToggle`

either a css selector to match a collection of cells or a jQuery collection.

__@param__ `hide`

_&nbsp; true, false. Default: false._

whether you want to show or hide the given collection of cells.

__@param__ `toggleAllOthers`

_&nbsp; true, false. Default: false._

whether to show or hide all the other cells that are not in the given collection.



### resetFilters

```Javascript
$('.thegrid').grid('resetFilters');
```

### sort

```Javascript
$('.thegrid').grid('sort', sortedCells);
```


## Events
The following events are triggered on the grid DOM element. You can use them like a standard event.

> _Do the event binding first before initializing the grid. Otherwise the ultra fast init will be complete before the event is bound._

### ready
The ready event happens very fast.

```Javascript
$('.thegrid').on('ready', function(){...});
```

### breakpointChange - on grid element
This event is triggered when the browser is resized.

```Javascript
$('.thegrid').on('breakpointChange');
```

### redraw
This event is triggered when The Grid has just finished redrawing the grid. Meaning recalculating the position of each cell and displaying them.

```Javascript
$('.thegrid').on('redraw', function(){...});
```