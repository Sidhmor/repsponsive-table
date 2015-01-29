(function($){
    $.fn.responsiveTable = function(options){
        var defaultOptions = {
            hideColumn: {}
        };
        var settings = $.extend( {}, defaultOptions, options );
        var elements = {};
        var inputHideTr = {};
        
        return this.each(function() {
            init(this);
        });
        
        /**
         * Punkt wejścia. Metoda wywoływana dla każdego węzła na którym uzyto
         * responsiveTable
         * 
         * @param {type} wrapper
         */
        function init(wrapper){
            elements.wrapper = $(wrapper);
            elements.wrapper.addClass('table table-responsive');
            getElements();
            buildMainElements();
            bindMainEvents();
            resizeWindow();
        };
        
        /**
         * Ustawienie podstawowych elementów
         */
        function getElements(){
            elements.thead = elements.wrapper.find('thead');
            elements.thead_th = elements.thead.find('th');
            elements.tbody = elements.wrapper.find('tbody');
            elements.tbody_tr = elements.tbody.find('tr');
        };
        
        /**
         * Przypięcie głównych zdarzeń elementów
         */
        function bindMainEvents(){
            $(window).resize(resizeWindow);
            elements.tbody.find('.preview-button').click(previewRecord);
            
            $.each(elements.thead_input, function(index, input){
                input.change(sortColumn);
            });
        };
        
        
        /**
         * Generowanie głównych elementów
         */
        function buildMainElements(){
            buildInputTh();
            buildData();
        };
        
        /**
         * Budowanie inputów nad kolumnami
         */
        function buildInputTh(){
            var tr = $('<tr>');
            elements.thead_input = {};
            
            elements.thead_th.each(function(index, th){
                var text = $(th).text();
                $(th).html('<span class="col-text">'+text+'</span>');
                $(th).addClass('col-sort-'+index);
                
                if(!$(th).hasClass('not-sort')){
                    elements.thead_input[index] = $('<input class="form-control col-sort col-sort-'+index+'" data-index="'+index+'"/>');
                    inputHideTr[index] = [];
                    tr.append($('<th class="col-sort-'+index+'">').append(elements.thead_input[index]));
                }
                else{
                    tr.append($('<th>'));
                }
            });
            
            tr.append('<th>');
            elements.thead.prepend(tr);
        };
        
        /**
         * Dodawanie odpowiednich klas do komórek tabeli
         */
        function buildData(){
            elements.tbody_tr.each(function(indexTr, tr){
                $(tr).data('index', indexTr).find('td').each(function(indexTd, td){
                    $(td).addClass('col-sort-'+indexTd).addClass('col-stat-data');
                });
                
                $(tr).append($('<td>').html('<button class="btn btn-success preview-button">Podgląd</button>'));
            });
        };
        
        /**
         * Zdarzenie sortowania kolumn
         */
        function sortColumn(){
             var index = $(this).data('index');
             var val = $(this).val();
             var tds = elements.tbody.find('td.col-sort-'+index);
             
             tds.each(function(indexTd, td){
                var tdText = $(td).text();
                var currTr = $(this).closest('tr');
                
                if(val !== '' && tdText.indexOf(val) === -1){
                    currTr.hide();
                    inputHideTr[index][currTr.data('index')] = currTr.data('index');
                }
                else {
                    inputHideTr[index][currTr.data('index')] = undefined;
                    
                    var showFlag = true;
                    
                    $.each(inputHideTr, function(index, trs){
                        if($.inArray(currTr.data('index'), trs) > -1){
                            showFlag = false;
                        }
                    });
                    
                    if(showFlag)
                        currTr.show();
                }
            });
        }
        
        /**
         * Zdarzenie zmiany wielkości okna (ukrycie kolumn)
         */
        function resizeWindow(){
            var widthTable = elements.wrapper.width();
            console.log(widthTable, 'width');
            $.each(settings.hideColumn, function(limit, columnsLimited){
                if(widthTable <= limit){
                    $.each(columnsLimited, function(key, columnId){
                        $('.col-sort-'+columnId).hide();
                    });
                }
                else{
                    $.each(columnsLimited, function(key, columnId){
                        $('.col-sort-'+columnId).show();
                    });
                }
            });
        }
        
        /**
         * Budowanie podglądu
         */
        function previewRecord(){
            var currTr = $(this).closest('tr');
            var previewTable = $('<table>');
            
            currTr.find('td.col-stat-data').each(function(indexTd, td){
                var theadTh = elements.thead.find('th:nth-child('+(parseInt(indexTd) + 1)+')');
                
                if(!theadTh.hasClass('not-preview')){
                    previewTable
                        .append($('<tr>')
                            .append($('<td>')
                                .text(theadTh.text()+': ')
                                .css({'text-align':'right', 'padding-right':'10px', 'font-weight':'bold'}))
                            .append($('<td>').text($(td).text())));
                }
            });
            
            previewTable
                .append($('<tr>')
                    .append($('<td>').css('text-align', 'center')
                        .append($('<button class="btn btn-success">Powrót</button>').click(closePreview))));
            
            elements.wrapper.after(previewTable).hide();
        }
        
        /**
         * Zdarzenie zamknięcia podglądu
         */
        function closePreview(){
            $(this).closest('table').remove();
            elements.wrapper.show();
        }
    };
})(jQuery);