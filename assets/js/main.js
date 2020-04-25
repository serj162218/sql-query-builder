;
(function (global){
    $().ready(function(){
        $("[data-name=addInputTable]").click(createInputTable);
    });
    let dataid = 0;
    let mode = null;
    let TableList = {};
    function createInputTable(){
        // 新建資料表
        let table = createTable();
        $("#InputTableDiv").append(table.element['input']);
        
    }
    function createTable(){
        let table = new Table();
        table.id = dataid;
        TableList[dataid] = table;
        let element = InputTableElement();
        table.setElement(element,"input");
        InputElementSetEvents(table);
        dataid++;
        return table;
    }
    function InputElementSetEvents(table){
        table.element['input'].on("click","[data-name=addColumn]",{table},addInputColumn);
        table.element['input'].on("click","[data-name=deleteTable]",{table},deleteTable);
        table.element['input'].on("change","[data-name=TableName]",{table},ChangeTableName);
        table.RegisterNameListener(function(val){
            for(i in this.element){
                this.element[i].children("text").text(val);
            }
        });
        table.RegisterDeleteListener(function(val){
            if(val == false) return;
            for(i in this.element){
                this.element[i].remove();
            }
            delete TableList[this.id];
        });
        table.RegisteraddColumnListener(function(column){
            if(typeof table.element['text'] == "undefined") return;
            column.setElement(CheckboxColumn(),"checkbox");
            for(i in column.element){
                switch(i){
                    case "input": break;
                    case "checkbox" : 
                        column.element[i].children("text").text(column.name);
                        table.element["text"].append(column.element[i]);
                        break;
                }
            }
        })
    }
    let InputTableElement = function(){
        return $($.parseHTML(`
        <div class="col-md-3 Table"> 
            <input type="text" data-name="TableName">
            <!-- 資料表的地方 -->
            <button data-name="addColumn">+</button><!-- 新增資料欄位按鈕 -->
            <button data-name="deleteTable">-</button> <!-- 刪除資料表按鈕 -->
        </div>`));
    }
    function deleteTable(event){
        let table = event.data.table;
        table.delete();
    }
    function getObjectLength(object = {}){
        let length = Object.keys(object).length;
        return length;
    }
    function addInputColumn(event){
        let table = event.data.table;
        let ColumnID = getObjectLength(table.columns);
        let column = new Column();
        column.id = table.id;
        column.uid = ColumnID;
        column.setElement(InputColumnElement(),"input");
        table.pushColumn(column,ColumnID);
        table.element['input'].append(column.element['input']);
        InputColumnSetEvents(table,column);
    }
    let InputColumnElement = function(){
        return $($.parseHTML(`
        <div class="container" data-name="Column">
            <!-- 資料欄位 -->
            <input type="text" class="col-md-10">
            <button data-name="deleteColumn">X</button>
        </div>
        `));
    }
    class Column{
        constructor(){
            this.element = {};
            this.name = "";
            this.selected = false;
        }
        setElement(element,name){
            this.element[name] = element;
        };
        set name(val){
            this.nameInterval = val;
            this.nameListener(val);
        }
        get name(){
            return this.nameInterval;
        }
        nameListener(val){};
        RegisterNameListener(listener){
            this.nameListener = listener;
        }
        set id(val){
            this.idInterval = val;
        }
        get id(){
            return this.idInterval;
        }
        set uid(val){
            this.uidInterval = val;
        }
        get uid(){
            return this.uidInterval;
        }
        delete(){
            this.deleteListener(true);
        }
        deleteListener(val){};
        RegisterDeleteListener(listener){
            this.deleteListener = listener;
        }
    }
    function InputColumnSetEvents(table,column){
        column.element["input"].on("change","[type=text]",{table,column},ColumnInputChange);
        column.element["input"].on("click","[data-name=deleteColumn]",{table,column},deleteColumn);
        column.RegisterNameListener(function(val){
            for(i in this.element){
                this.element[i].children("text").text(val);
            }
            //TODO 當TableName改變時，改變此Table的elements裡面的全部element的TableName
        });
        column.RegisterDeleteListener(function(val){
            if(val == false) return;
            //TODO 當TableName改變時，改變此Table的elements裡面的全部element的TableName
            for(i in this.element){
                this.element[i].remove();
            }
            delete table.columns[column.uid];
        });
    }
    function ColumnInputChange(event){
        let column = event.data.column;
        column.name = $(this).val();
    }
    function deleteColumn(event){
        let column = event.data.column;
        column.delete();
    }
    function ChangeTableName(event){
        let table = event.data.table;
        table.name = $(this).val();
    }

    class Table{
        constructor(){
            this.element = {};
            this.columns = {};
            this.name = "";
            this.selected = false;
        }
        setElement(element,name){
            this.element[name] = element;
        };
        pushColumn(column,id){
            this.columns[id] = column;
            this.addColumnListener(column);
        }
        addColumnListener(val){};
        RegisteraddColumnListener(listener){
            this.addColumnListener = listener;
        }
        set name(val){
            this.nameInterval = val;
            this.nameListener(val);
        }
        get name(){
            return this.nameInterval;
        }
        nameListener(val){};
        RegisterNameListener(listener){
            this.nameListener = listener;
        }
        set id(val){
            this.idInterval = val;
        }
        get id(){
            return this.idInterval;
        }
        delete(){
            this.deleteListener(true);
        }
        deleteListener(val){};
        RegisterDeleteListener(listener){
            this.deleteListener = listener;
        }
    }
    
    $().ready(function(){
        $("#ModeDiv > button").click(createSelectTable);
    });
    function createSelectTable(){
        mode = $(this).attr("data-mode");
        renderMainTable();
    }
    function renderMainTable(){
        if(isModeCanChooseMultipleTable()){
            clear($("#JoinTableDiv"));
            clear($("#JoinOnTableDiv"));
        }
        for(i in TableList){
            let table = TableList[i];
            if(typeof table.element['text'] != "undefined"){
                continue;
            }
            table.setElement(TextTableElement(),"text");
            table.element['text'].children("text").text(table.name);
            $("#SelectTableDiv").append(table.element['text']);
            SelectTableSetEvents(table);
            header = SelectTableHeader(table.id);
            table.element['text'].prepend(header);
            let columns = table.columns;
            console.log(columns);
            for(j in columns){
                let column = columns[j];
                if(Object.keys(column.element).includes("checkbox")) continue;
                column.setElement(CheckboxColumn(),"checkbox");
                column.element['checkbox'].children("text").text(column.name);
                table.element["text"].append(column.element['checkbox']);
            }
        }
        RenderTableBtn();
    }
    let TextTableElement = function(){
        return $($.parseHTML(`
        <div class="col-md-3 Table">
        <text></text>
        </div>`));
    }
    let SelectTableHeader = function(){
        return $($.parseHTML(`
            <input type="radio" name="SelectMainTable">
        `));
    }
    function SelectTableSetEvents(table){
        table.element['text'].on("change",`[type="radio"]`,{table},ChooseMainTable);
    }
    function ChooseMainTable(event){
        //選擇主表
        for(i in TableList){
            TableList[i].selected = false;
        }
        let table = event.data.table;
        table.selected = true;
    }
    let CheckboxColumn = function(){
        return $($.parseHTML(`
        <div class="container" data-name="Column">
            <!-- 資料欄位 -->
            <input type="checkbox">
            <text></text>
        </div>
        `));
    }
    function RenderTableBtn(){
        if(isModeCanChooseMultipleTable()){
            $("#JoinOnBtnDiv").html(JoinOnButton);
            $("#WhereTableBtnDiv").html(WhereButton);
        }else{
            $("#JoinOnBtnDiv").html(``);
            $("#WhereTableBtnDiv").html(WhereButton);
        }
    }
    function isModeCanChooseMultipleTable(){
        if(mode != "insert"){
            return true;
        }else{
            return false;
        }
    }
    let WhereButton = function(){
        return $($.parseHTML(`<button class="btn btn-warning" id="WhereBtn"> Where 條件</button>`));
    }
    let JoinOnButton = function(){
        return $($.parseHTML(`<button class="btn btn-warning" id="JoinOnBtn"> On 條件</button>`));
    }
    
    function clear(dom){
        dom.empty();
    }
    function remove(dom){
        dom.remove();
    }
    /*
    function isNeedJoinTable(){
        if(!isModeCanChooseMultipleTable()) return ;
        RenderJoinTable($(this));
    }
    function RenderJoinTable(dom){
        clear($("#JoinTableDiv"));
        clear($("#JoinOnTableDiv"));
        $.each($(".MainTable"),function(i,e){
            e = $(e);
            let id = $(e).attr("data-id");
            let table = TableElement(id,"JoinTable");
            let option = JoinOption(id);
            if(dom.attr('data-id')==e.attr('data-id')) option = MainTableOption(id);
            table.prepend(option);
            let value = $(e).children("[type=text]").val();
            TableAppendText(table,value);
            $.each(e.children("[data-name=Column]"),function(index,element){
                let column = TextColumn(index);
                table.append(column);
                let value = $(element).children("[type=text]").val();
                column.children("text").text(value);
            });
            $("#JoinTableDiv").append(table);
        });
    }
    let TextColumn = function(id){
        return $($.parseHTML(`
        <div class="container" data-name="Column" data-id=${id} data-type="Join">
            <!-- 資料欄位 -->
            <input type="checkbox" data-id=${id} data-name="JoinTable">
            <text></text>
        </div>
        `));
    }
    let MainTableOption = function(id){
        return $($.parseHTML(`
        <span data-id=${id} data-name="JoinMode">
            <select>
                <option data-v="0">主表</option>
            </select>
            <br>
        </span>`));
    }
    let JoinOption = function(id){
        return $($.parseHTML(`
        <span data-id=${id} data-name="JoinMode">
            <select data-id=${id}>
                <option data-v="-1">不選取</option>
                <option data-v="1">Inner Join</option>
                <option data-v="2">Left Join</option>
                <option data-v="3">Right Join</option>
                <option data-v="4">Outer Join</option>
            </select>
            <br>
        </span>`));
    }
    $().ready(function() {
        $("body").on("click","#JoinOnBtn",JoinOnRenderTable);
        $("body").on("click",".addColumn",JoinOnRenderColumn);
    });
    function JoinOnRenderTable(){
        clear($("#JoinOnTableDiv"));
        let selects = $(`[data-name=JoinMode] select`);
        selects.each(function(index){
            if(!IsNeedRender(this)){
                return;
            }
            let id = $(this).attr("data-id");
            let table = TableElement(id,"JoinOnTable");
            let TableName = $(`.SelectTable[data-id=${id}]`).children("text").text();
            TableAppendText(table,TableName);
            table.append(`<br>`);
            table.append(`<button class="addColumn" data-id="${id}">+</button>`);
            table.append(`<br>`);
            $("#JoinOnTableDiv").append(table);
        });
    }
    function IsNeedRender(dom){
        let SelectedOptionID = $(dom).children("option:selected").attr("data-v");
        let isNeed = false;
        let isNeedIDList = ["1","2","3","4"];
        if(isNeedIDList.includes(SelectedOptionID)) isNeed = true;
        return isNeed;

    }
    let uid = 0;
    function JoinOnRenderColumn(){
        let id = $(this).attr("data-id");
        let table = $(`.JoinOnTable[data-id=${id}]`);
        let column = JoinOnColumn(id,uid++);
        selects = column.children("select");
        let selectA = selects.eq(0);
        let selectB = selects.eq(3);
        $(`.JoinTable`).each(function(index){
            let TableName = $(this).children("text").text();
            let id = $(this).attr("data-id");
            selectA.append(`<option data-id=${id}>${TableName}</option>`);
            selectB.append(`<option data-id=${id}>${TableName}</option>`);
        });
        let selectOp = selects.eq(2);
        selectOp.append(operatorOption);
        table.append(column);
        selectA.change();
        selectB.change();
        
    }
    $().ready(function() {
        $("body").on("change","select[type=table]",SelectTableToChangeColumn);
    });
    function SelectTableToChangeColumn(){
        console.log("got trigger");
        let id = $('option:selected',this).attr("data-id");
        let name = $(this).attr('data-name');
        let uid = $(this).attr("data-uid");
        let select = $(`[data-uid=${uid}][data-name=${name}][type=column]`);
        clear(select);
        let columns = $(`.JoinTable[data-id=${id}]`).children(`[data-name=Column]`);
        columns.each(function(index){
            let text = $(this).children("text").text();
            select.append(`<option>${text}</option>`);
        });

    }
    let JoinOnColumn = function(id,uid){
        return $($.parseHTML(`
        <span data-name="Column">
            <select data-id=${id} data-uid=${uid} data-name="tableA" type="table">
            </select>
            <select data-id=${id} data-uid=${uid} data-name="tableA" type="column"></select>
            <select data-id=${id} data-uid=${uid} data-name="operator" type="operator"></select>
            <select data-id=${id} data-uid=${uid} data-name="tableB" type="table">
            </select>
            <select data-id=${id} data-uid=${uid} data-name="tableB" type="column"></select>
            <button data-name="deleteColumn">X</button>
            <br>
        </span>
        `));
    }
    let operatorOption = function(){
        return $($.parseHTML(`
            <option>=</option>
            <option>!=</option>
            <option>>=</option>
            <option>></option>
            <option><=</option>
            <option><</option>
        `));
    };
    //--- 
    // function TableAppendText(table,val){
    //     table.append("<text></text>");
    //     table.children("text").text(val);
    // }
    */

})(this);