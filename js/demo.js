$(document).ready(function()
{
    $(window).on('keyup', function(e)
    {
        // Pressed escape key.
        if (e.which === 27 && $('#see-the-code').is(':checked'))
        {
            $('#see-the-code').prop('checked', false);
            return false;
        }
    });


    if ($('pre').length) syntaxHighlighter();
});



String.prototype.htmlize = function()
{
    return this.replace(/&(l|g)t;/g, function(){return {l: '<', g: '>'}[arguments[1]]});
};

var syntaxHighlighter = function()
{
    var lastTreatedWrapper = 0, wrapperIndex = -1;
    $('pre').each(function(i)
    {
        var pre = $(this),
            wrapper = pre.parents('.code-wrapper'),

            type = pre.data('type');

        if (wrapper.length && wrapperIndex !== lastTreatedWrapper)
        {
            wrapperIndex++;
            lastTreatedWrapper = wrapperIndex;

            if (wrapper.data('result'))
            {
                var html = wrapper.find('pre[data-type="html"]').html().htmlize(),
                    js = wrapper.find('pre[data-type="javascript"]').html(),
                    css = wrapper.find('pre[data-type="css"]').html().htmlize(),
                    contents = '<html><head><link rel="stylesheet" type="text/css" href="../css/grid.css">'
                    + '<script src="../bower_components/jquery/dist/jquery.min.js"></script>'
                    + '<script src="../bower_components/jquery.easing/js/jquery.easing.min.js"></script>'
                    + '<script src="../js/grid.js"></script>'
                    + '<style>' + css + '</style></head><body>'
                    + html
                    + '<script>' + js + '</script>'
                    + '</body></html>';
                wrapper
                    .prepend('<input type="radio" data-type="result" name="code-wrapper' + wrapperIndex + '" id="result' + i + '" /><label for="result' + i + '">result</label>')
                    .append('<iframe data-type="result"></iframe>')
                    .find('iframe')[0].contentDocument.write(contents);
            }
        }

        var html = '',
            radioId = i + '-' + type,
            checked = pre.data('default') !== undefined ? '  checked' : '';

        switch (type)
        {
            case 'html':
                html = this.innerHTML.replace(/&lt;(\/?)(\w+) ?(.*?)&gt;/mg, function()
                {
                    var attributes = '';

                    if (arguments[3])
                    {
                        var attrs = arguments[3].split(' ');
                        for (var i = 0, l = attrs.length; i < l; i++)
                        {
                            attributes += ' ' + attrs[i].replace(
                                /((?:\w|-)+)=('|"|)(.*?)\2/,
                                '<span class="attribute">$1</span>'
                                + '<span class="ponctuation">=</span>'
                                + '<span class="quote">"$3"</span>');
                        }
                    }

                    return '<span class="ponctuation">&lt;' + arguments[1] + '</span>'
                           + '<span class="tag">' + arguments[2] + '</span>'
                           + attributes + '<span class="ponctuation">&gt;</span>';
                });
            break;
            case 'css':
                html = this.innerHTML
                .replace(/((?:\/\*\s*))*([^{]+)\s*{\s*([^}]+)\s*}\s*(?:\*\/)*\s*/mg, function()
                {
                    // If commented dont parse inner.
                    if ((arguments[1]||'').indexOf('/*') > -1)
                        return '\n<span class="comment">/* '+ arguments[2] + '{\n    ' + arguments[3] + '\n} */</span>';

                    if (arguments[3])
                    {
                        var properties = '', props = arguments[3].split(';');

                        for (var i = 0, l = props.length; i < l; i++) if (props[i])
                        {
                            properties += '\n    ' + props[i].replace(
                                /\s*([^:]+)\s*:\s*([^;]+)\s*;?\s*/, function()
                                {
                                    return '<span class="attribute">'
                                            + arguments[1]
                                            + '</span>'
                                            + '<span class="ponctuation">: </span>'
                                            + '<span class="value">'
                                            + arguments[2]
                                                .replace(/([(),])/g, '<span class="ponctuation">$1</span>')
                                            + '</span><span class="ponctuation">;</span>';
                                });
                        }
                    }

                    return '\n<span class="selector">' + arguments[2].replace(/(:(?:before|after))/, '<span class="keyword">$1</span>') + '</span>'
                        +' <span class="ponctuation">{</span>' + properties + '\n<span class="ponctuation">}</span>';
                });
            break;
            case 'javascript':
                html = this.innerHTML
                        .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
                        .replace(/(\/\*[\s\S]*\*\/)/mg, '<span class="comment">$1</span>')
                        .replace(/(\b\d+|null\b)/g, '<span class="number">$1</span>')
                        .replace(/(\btrue|false\b)/g, '<span class="bool">$1</span>')
                        .replace(/('[\s\S]*?')/mg, '<span class="quote">$1</span>')
                        .replace(/(new|$|function|document|window)/g, '<span class="keyword">$1</span>')
                        .replace(/\$/g, '<span class="dollar">$</span>')
                        .replace(/([\[\](){}.;:,+\-?])/g, '<span class="ponctuation">$1</span>')
                        // Following will wrap '=' THAT ARE NOT INSIDE HTML TAG (e.g. <span class="ponctuation">).
                        // Javascript regex does not support lookbehinds. (T_T)
                        .replace(/(?!(?:.(?=[^<]))*>)=/g, '<span class="ponctuation">=</span>')
            break;
        }

        if (html) this.innerHTML = html;

        if (wrapper.length) wrapper.prepend(
            '<input type="radio" data-type="' + type + '" name="code-wrapper' + wrapperIndex
            + '" id="pre' + radioId + '"' + checked + '><label for="pre' + radioId + '">' + type + '</label>');
        else {pre.wrap('<div class="code-wrapper no-tabs ' + pre.attr('class') + '" data-type="' + type + '"/>')}
    });
};