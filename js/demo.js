$(document).ready(function()
{
    $('.thegrid').grid(
    {
        cells: '.cell',
        cellHeight: 100,
        cellsPerRow: 7,
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
});