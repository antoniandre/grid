/**
 * The grid.
 *
 * @author    Antoni André. http://antoniandre.me
 * @see       http://github.com/antoniandre/grid
 * @version   1.0
 * @since     2016-10-21
 * @license   MIT
 */
var thegrid = function(options)
{
    /**
     * Private vars.
     * We don't want to mess them up from outside the class.
     *
     * @access private.
     */
    var self = this, grid, cells, cellsNum, cellWidth, cellHeight,
        defaults =
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
            animationEasing: 'linear',
            animationSpeed: 500,
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
        },

        /**
         * Internal matrix class to handle all the calculations.
         * Represent the grid as a matrix like:
         * [0 0 0 0
         *  0 0 0 0
         *  0 0 0 0
         *  0 0 0 0].
         * Don't forget the optimization is very important as we trigger the redraw() function on resize event.
         * The inject() method will inject the given cell at a given position providing cell dimension in units.
         *
         * @access Private.
         */
        gridMatrix =
        {
            matrix: [],// The matrix in use for placing cells.
            cols: 0,// Cache the cols number for optimization as used few times in this class.
            rows: 0,// Cache the rows number for optimization as used few times in this class.
            emptyCells: [],// Index the empty cells for faster results.

            /**
             * Creates the matrix with the specified dimensions.
             * And fill each cell with Null to represent cell availability.
             *
             * @access Public.
             * @return {Object} The current instance.
             */
            init: function()
            {
                this.emptyCells = [];
                this.cols = self.options.cellsPerRow;
                this.rows = Math.ceil(cellsNum / this.cols);
                this.matrix = matrix(this.cols, this.rows, null);

                // First index the whole matrix cells in this.emptyCells array as every cell is empty.
                // Indexing the empty cells for optimization.
                for (var row = 0; row < this.rows; row++) {
                    for (var col = 0; col < self.options.cellsPerRow; col++) {
                        this.emptyCells.push(row + "." + col);// Creating decimal format to benefit from the simple numeric sorting.
                    }
                }
                return this;
            },

            /**
             * Adds an empty cell to the quick index array - for optimization.
             *
             * @access Public.
             * @param {String} position: The [x, y] coordinates in matrix.
             */
            addEmptyCell: function(position)
            {
                this.emptyCells.push(position[1] + '.' + position[0]);
                this.emptyCells.sort(function(a, b){return a - b});
            },

            /**
             * Removes an empty cell.
             *
             * @access Public.
             * @param {String} position: The [x, y] coordinates in matrix.
             */
            removeEmptyCell: function(position)
            {
                // IE8-:
                // for (var cell = 0, l = this.emptyCells.length; cell < l; cell++) {
                //     if (this.emptyCells[cell] === position[1] + ',' + position[0]) this.emptyCells.splice(cell, 1);
                // }
                // Modern browsers:
                var index = this.emptyCells.indexOf(position[1] + '.' + position[0]);
                if (index > -1) this.emptyCells.splice(index, 1);
                this.emptyCells.sort(function(a, b){return a - b});
            },

            /**
             * Inject the cell content in matrix.
             * The matrix here won't contain any HTML it will only hold the given DOM cell index.
             *
             * @access Public.
             * @param {String} cellContent: The cell content
             * @param {String} dimension: The dimension
             * @param {String} position: The [x, y] coordinates in matrix.
             * @return {Array} The [x, y] coordinates in matrix.
             */
            inject: function(cellContent, dimension, position)
            {
                // Store the dimension (in units) of the cell we want to inject in matrix.
                var dim = {w: dimension[0], h: dimension[1]},
                    fillCellsWidth = dim.w,
                    fillCellsHeight = dim.h;

                // At what matrix position do we inject the cell content.
                if (position === undefined) position = this.getNextEmptyCell();

                // Inject when a matrix position where cell content is fitting is found.
                while (!this.canFit(dimension, position))
                {
                    position = this.getNextCell(position);
                }
                // Now that a place is found in matrix to fit the content fill the needed matrix cells.
                var x = position[0], y = position[1];
                while (fillCellsWidth > 0)
                {
                    this.matrix[y][x] = cellContent;
                    this.removeEmptyCell([x, y]);
                    fillCellsHeight = dim.h - 1;

                    while (fillCellsHeight > 0)
                    {
                        y++;
                        this.matrix[y][x] = cellContent;
                        this.removeEmptyCell([x, y]);
                        fillCellsHeight--;
                    }
                    fillCellsWidth--;

                    x++;
                }

                return position;
            },

            /**
             * Gets the next empty cell.
             *
             * @access Public.
             * @return {Array} The next empty cell [x, y] coordinates in matrix.
             */
            getNextEmptyCell: function()
            {
                if (!this.emptyCells.length) return this.addNewRow();

                var yx = this.emptyCells[0].split('.');
                // console.log('getNextEmptyCell', this.emptyCells, 'returning first empty cell: [x:'+yx[1]+', y:'+yx[0]+']', [parseInt(yx[1]), parseInt(yx[0])]);
                return [parseInt(yx[1]), parseInt(yx[0])];

            },

            /**
             * Gets the next cell whether it is empty or not.
             *
             * @access Public.
             * @param {Array} position: The [x, y] coordinates in matrix.
             * @return {Array} The next cell [x, y] coordinates in matrix.
             */
            getNextCell: function(position)
            {
                if (position === undefined) position = [0, 0];
                // console.log('getNextCell returns next existing cell position:', this.matrix[position[1]][position[0] + 1] !== undefined ? [position[0] + 1, position[1]] : [0, position[1] + 1])
                                                                               // : [0, position[1] + 1])

                // Look for a cell on the right of the current one, if none take the first one of the following row.
                return this.matrix[position[1]][position[0] + 1] !== undefined ? [position[0] + 1, position[1]] : [0, position[1] + 1];
            },

            /**
             * Adds a new row to the matrix.
             *
             * @access Public.
             * @return {Array} The [x, y] coordinates in matrix of the first cell of the new row.
             */
            addNewRow: function()
            {
                this.matrix.push(matrix(this.cols, 1, null)[0]);
                this.rows++;
                for (var i = 0; i < this.cols; i++) this.addEmptyCell([i, this.rows - 1]);

                return [0, this.rows - 1];
            },

            /**
             * Determines if cell is empty at the given position.
             *
             * @access Public.
             * @param {Array} position: The [x, y] coordinates in matrix.
             * @return {Boolean} True if cell is empty, False otherwise.
             */
            isCellEmpty: function(position)
            {
                if (this.matrix[position[1]] === undefined)
                {
                    this.addNewRow();
                    return true;
                }
                // console.log('checking if cell empty:', this.matrix[position[1]][position[0]] === null);
                return this.matrix[position[1]][position[0]] === null;
            },

            /**
             * Determines the ability to fit the given cell in matrix at a given position.
             *
             * @access Public.
             * @param {Array} dimension: The dimension (in units) of the cell you want to put in matrix [width, height].
             * @param {Array} position: The [x, y] coordinates where to place the cell in matrix.
             * @return {Boolean} True if able to fit, False otherwise.
             */
            canFit: function(dimension, position)
            {
                var w = dimension[0],
                    h = dimension[1],
                    x = position[0],
                    y = position[1],
                    canFitWidth = 0,
                    canFitHeight = 0;

                // If the cell exists (different of undefined) and is empty.
                for (var i = x; i < x + w; i++) if (this.isCellEmpty([i, y]) === true) {canFitWidth++;}
                for (var j = y; j < y + h; j++) if (this.isCellEmpty([x, j]) === true) {canFitHeight++;}

                // console.log('cell with dimension [w: '+w+', h: '+h+'] can fit at position [x:'+x+', y:'+y+']', (canFitWidth >= w && canFitHeight >= h))
                return canFitWidth >= w && canFitHeight >= h;
            }
        };


    // Public vars.
    self.throttleTimer = null;
    // Uncomment for debugging.
    // self.gridMatrix = gridMatrix;


    /**
     * Loop through each DOM element in the 'cells' collection and place them in the created matrix according to availability.
     * Called internally by init() and redraw().
     *
     * @access Private.
     */
    var fillMatrix = function()
    {
        // Create the matrix to the specified dimensions.
        gridMatrix.init(self.options.cellsPerRow, Math.ceil(cellsNum / self.options.cellsPerRow), null);

        cells.each(function(i, cell)
        {
            cell = $(cell);
            var unitWidth = Math.min(cell.data('width'), self.options.cellsPerRow) || 1,
                unitHeight = cell.data('height') || 1,
                matrixPosition = gridMatrix.inject(i, [Math.min(unitWidth, self.options.cellsPerRow), unitHeight]);

            // Remember the matrix position in DOM pure js element itself.
            cell[0].matrixPosition = {x: matrixPosition[0], y: matrixPosition[1]};
        });
    };


    /**
     * Render the grid.
     * Called internally by init() and redraw().
     *
     * @access Private.
     */
    var render = function()
    {
        cells.each(function(i, cell)
        {
            cell = $(cell);
            // If reduce screen until a cell width doesn't fit grid width then constrain it to the grid width.
            var unitWidth = Math.min(cell.data('width'), self.options.cellsPerRow) || 1,
                unitHeight = cell.data('height') || 1,
                newCss =
                {
                    width: (cellWidth * unitWidth) + '%',
                    height: cellHeight * unitHeight,
                    top: cell[0].matrixPosition.y * cellHeight,
                    left: (cell[0].matrixPosition.x * 100 / self.options.cellsPerRow) + '%',
                };

            setTimeout(function()
            {
                self.options.animationPlatform === 'js' ? cell.stop(true, true).animate(newCss, self.options.animationSpeed, self.options.animationEasing)
                                              : cell.css(newCss);
            }, self.options.animationDelay);
        });

        // After the cells positionning the grid height might have changed. Update if updateGridHeight is set to true.
        if (self.options.updateGridHeight) grid.height(gridMatrix.rows * self.options.cellHeight);
    };


    /**
     * Update parameters.
     *
     * @access Public.
     * @param {Object} params: The parameters to update. Will be overriding the current parameters.
     * @return {Object} The current instance.
     */
    self.updateParams = function(params)
    {
        // Merge current settings and overriding new ones given as parameter.
        self.options = $.extend(options, params);

        cellWidth = 100 / self.options.cellsPerRow;
        cellHeight = self.options.cellHeight;

        return this;
    };


    /**
     * Show or hide the given collection of cells retaining the given order.
     *
     * @access Public.
     * @param {jQuery Collection or selector string} cellsToToggle: either a css selector to match a collection of cells
     *                                                              or a jQuery collection of cells to toggle.
     * @param {Boolean} hide: whether to show or hide the given collection of cells.
                              Default: false.
     * @param {Boolean} toggleAllOthers: whether to show or hide all the other cells that are not in the given collection.
                                         Default: false.
     * @return {Object} The current instance.
     */
    self.filter = function(cellsToToggle, hide, toggleAllOthers)
    {
        hide            = hide !== undefined ? hide : false;
        toggleAllOthers = toggleAllOthers !== undefined ? toggleAllOthers : false;
        // In case you the provide collection is not a jQuery object.
        cellsToToggle   = cellsToToggle instanceof jQuery ? cellsToToggle : $(cellsToToggle);
        cellsToShow     = hide ? (toggleAllOthers ? $(self.options.cells).not(cellsToToggle) : null) : cellsToToggle;
        cellsToHide     = hide ? cellsToToggle : (toggleAllOthers ? $(self.options.cells).not(cellsToToggle) : null);

        // If the given selection is to show, keep its specific order in case of prior sorting.
        if (cellsToShow) cellsToShow.css({top: 0, left: 0}).removeClass('hidden');
        if (cellsToHide)
        {
            cellsToHide.addClass('hidden');
            setTimeout(function(){cellsToHide.css({top: 0, left: 0})}, self.options.animationSpeed);
        }

        cells = cellsToShow;
        cellsNum = cells.length;

        return this;
    }


    /**
     * Reset all the applied filters and go back to the original cells collection from the DOM.
     *
     * @access Public.
     * @return {Object} The current instance.
     */
    self.resetFilter = function()
    {
        cells = $(self.options.cells).removeClass('hidden');
        cellsNum = cells.length;

        return this;
    }


    /**
     * Redraw function to:
     * 1 - recalculate the disposition of cells in grid according to new dimensions and options.
     * 2 - render the new grid disposition.
     * Then trigger the redraw event.
     *
     * @access Public.
     * @return {Object} The current instance.
     */
    self.redraw = function()
    {
        fillMatrix();
        render();

        grid.trigger('redraw');

        return this;
    };


    /**
     * Bind the grid related events on grid init.
     *
     * @access Private.
     * @return void.
     */
    var bindEvents = function()
    {
        if (!$.isEmptyObject(self.options.breakpoints))
        {
            var currentBreakpoint,
                breakpointsArray = [],
                breakpointsNum,
                initialConfigIndex = 0;

            // Convert to breakpoints object an array for sorting.
            for (var breakpoint in self.options.breakpoints) breakpointsArray.push(breakpoint * 1);
            breakpointsNum = breakpointsArray.length;


            // NATURAL numeric ascendant sorting (*1 is shorthand for parseInt()).
            breakpointsArray.sort(function(a, b){return a*1 - b*1});

            // Add the initial config (i.e. 'widest') into the breakpoints object and breakpoints array.
            // E.g. [479, 767, 1199, "1199++"].
            // It would be easier to have all integers but outputting breakpoint number to the end user through the 6breakpointChange
            // event has to be meaningful.
            initialConfigIndex = breakpointsArray[breakpointsNum - 1] + '++';
            self.options.breakpoints[initialConfigIndex] = JSON.parse(JSON.stringify(self.options));
            delete self.options.breakpoints[initialConfigIndex].breakpoints;// Don't need to keep this.
            breakpointsArray.push(initialConfigIndex);
            breakpointsNum++;

            $(window).on('resize gridInit afterResize', function(e)
            {
                // If throttling is on exit quickly for better performance.
                // So keep this first.
                if (self.options.throttling)
                {
                    // If throttling is on and resize event triggered only set a timeout
                    // (to trigger a custom afterResize event) and return.
                    if (e.type === 'resize')
                    {
                        self.throttleTimer = setTimeout(function()
                        {
                            clearTimeout(self.throttleTimer);
                            self.throttleTimer = null;
                            $(window).trigger('afterResize');
                        }, self.options.throttlingDelay);
                        return true;
                    }
                }
                var params = {},
                    screenWidth = this.innerWidth,
                    tmpBp = [],
                    newBreakpoint,
                    breakpointChange = false;

                // Best optimized code possible:
                // Way faster than for loop on given breakpoints.
                // Also faster than a series of if / else if.
                // The idea is to have an array of breakpoints and add the current screenWidth in it and ASC sort the array.
                // Then locate the position of the screenWidth in array and get the breakpoint just above to get its config.
                tmpBp = breakpointsArray.slice(0);// Clone array.
                tmpBp.push(screenWidth);// Add screenWidth to the array.

                // Sort NATURAL ASC and always put '++' (for init config) at the end (e.g. [479, 767, 790, 1199, "1199++"]).
                tmpBp.sort(function(a, b){return (typeof a === 'string' && a.indexOf('++') > -1) || a*1 - b*1});
                var i = tmpBp.indexOf(screenWidth);// Get the position of screenWidth in the breakpoints array.

                // If the index is the last one (initial and widest screen config), breakpointsArray[i] won't exist so
                // just reapply initial config.
                newBreakpoint = breakpointsArray[i];
                breakpointChange = newBreakpoint !== currentBreakpoint;

                // Only redraw if current breakpoint has changed or if we want to recalculate height at each step..
                if (breakpointChange || typeof self.options.cellHeight === 'function')
                {
                    currentBreakpoint = newBreakpoint;

                    // Trigger the breakpointChange event but skip the init one.
                    if (e.type !== 'gridInit' && breakpointChange) grid.trigger('breakpointChange', [currentBreakpoint]);

                    // Apply settings of the detected breakpoint config.
                    params = self.options.breakpoints[currentBreakpoint];

                    self.updateParams(params).redraw();
                }
            });
        }
    };


    /**
     * Init the grid, only once. This is the entry point and self-called.
     * Set the grid options from parameters,
     * bind the grid events,
     * fill the matrix with cells in DOM and render for the first time.
     *
     * @access Private.
     */
    var init = function()
    {
        // Merge default settings and overriding options given as parameter.
        self.options = $.extend(defaults, options);

        // Init the core vars.
        grid = $(self.options.grid);
        // self.gridWidth = grid.width();
        cells = $(self.options.cells).not('.hidden');
        cellsNum = cells.length;
        cellWidth = 100 / self.options.cellsPerRow;
        cellHeight = self.options.cellHeight;

        // First set the grid approximate height before calculating the cells position.
        // After the cells placing the grid height will probably be different.
        grid.css('height', Math.ceil(cellsNum / self.options.cellsPerRow) * self.options.cellHeight);


        bindEvents();
        fillMatrix();
        render();

        // Force check current breakpoint at init.
        if (!$.isEmptyObject(self.options.breakpoints)) $(window).trigger('gridInit');

        // Trigger ready custom event available for external use.
        grid.trigger('ready').addClass('ready' + (self.options.animationPlatform === 'js' ? '' : ' transitions'));
    }();
},

/**
 * Helper function.
 * Creates a matrix of the given size and fill each cell with a default value.
 *
 * @param {number} cols The columns number.
 * @param {number} rows The rows number.
 * @param {mixed} defaultValue The default value for each cell.
 * @return {Array} the generated matrix.
 */
matrix = function(cols, rows, defaultValue)
{
    for (var i = 0, arr = []; i < rows; i++)
    {
        arr.push([]);// Creates an empty line.
        arr[i].push(new Array(cols));// Adds cols to the empty line.
        for (var j=0; j < cols; j++) arr[i][j] = defaultValue;// Initializes.
    }

    return arr;
};



/**
 * Eventually make the jQuery plugin wrapper.
 *
 * @param  {Object|String} firstArg: can hold either a method name or an object of parameters for init.
 * @return {Object} The current instance.
 */
$.fn.grid = function(firstArg)
{
    // The DOM element on which we call the grid plugin.
    var gridElement = this[0];

    if (!gridElement || gridElement === undefined)
    {
        console.error('Can\'t instanciate The Grid on an empty jQuery collection.');
        return;
    }
    if (['object', 'undefined', 'string'].indexOf(typeof firstArg) === -1)
    {
        console.warn('Ignoring grid call with wrong params.');
        return;
    }

    // Instanciate The Grid.
    if (typeof firstArg === 'object' || firstArg === undefined)
    {
        (firstArg || {grid: null}).grid = gridElement;
        gridElement.grid = new thegrid(firstArg);
    }

    // Call a grid method (with params) from its name as a string.
    // E.g. $('.thegrid').grid('filter', [cellsToToggle, hide, toggleAllOthers]);
    // First check method exists before calling it.
    else if (typeof firstArg === 'string' && gridElement !== undefined && typeof (gridElement).grid[firstArg] === 'function')
    {
        // Extract rest arguments from built-in 'arguments' pseudo-array (no array method avail on arguments).
        var args = [].slice.call(arguments, 1);

        // Call the object method with given args.
        gridElement.grid[firstArg].apply(this, args);
    }

    return this;
};

