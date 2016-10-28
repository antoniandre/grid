$(document).ready(function()
{
    setTimeout(function()
    {    
        var gh = new gridHandler(
        {
            grid: '.grid',
            cells: '.cell',
            cellHeight: 100,
            cellsPerRow: 7,
            animationSpeed: 1200,
            animationEasing: 'easeOutElastic',
            updateGridHeight: true,
            breakpoints:
            {
                1199:
                {
                    cellsPerRow: 5,
                    cellHeight: 100
                },
                767:
                {
                    cellsPerRow: 4,
                    cellHeight: 130
                },
                479:
                {
                    cellsPerRow: 2,
                    cellHeight: 160
                },
            }
        });

    }, 2000);
    /*$('.grid').grid(
    {
        cells: '.cell',
        cellHeight: 100,
        cellsPerRow: 7,
        animationSpeed: 1200,
        animationEasing: 'easeOutElastic',
        updateGridHeight: true,
        breakpoints:
        {
            1199:
            {
                cellsPerRow: 5,
                cellHeight: 100
            },
            767:
            {
                cellsPerRow: 4,
                cellHeight: 130
            },
            479:
            {
                cellsPerRow: 2,
                cellHeight: 160
            },
        }
    });*/
});