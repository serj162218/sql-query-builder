;
(function (global){
    $().ready(function(){
        $("[data-name=addTable]").click(createMainTable);
        $("body").on("click","[data-name=deleteTable]",deleteMainTable);
        $("body").on("click","[data-name=addColumn]",addTableRow);
        $("body").on("click","[data-name=deleteColumn]",deleteTableRow);
    });
    let dataid = 0;
    let mode = null;
    function createMainTable(){
        // 新建資料表
        switch($(this).attr("data-type")){
            case "main":
                addMainTable();
                break;
            case 1:
                break;
            default:
                addMainTable();
        }
    }
    let MainTable = function(){
        return $($.parseHTML(`
        <div class="col-md-3 MainTable Table" data-id="${dataid}"> 
            <input type="text" data-name="TableName">
            <!-- 資料表的地方 -->
            <button data-name="addColumn" data-id="${dataid}" data-type="Main">+</button> <!-- 新增資料欄位按鈕 -->
            <button data-name="deleteTable" data-id="${dataid}" data-type="Main">-</button> <!-- 刪除資料表按鈕 -->
        </div>`));
    }
    let Column = function(id){
        return $($.parseHTML(`
        <div class="container" data-name="Column" data-id=${id}>
            <!-- 資料欄位 -->
            <input type="text" class="col-md-10">
            <button data-name="deleteColumn">X</button>
        </div>
        `));
    }
    function addMainTable(){
        $("#MainTableDiv").append(MainTable);
        syncTableCount();
    }
    function syncTableCount(){
        dataid++;
    }
    function deleteMainTable(){
        $(this).closest(".MainTable").remove();
        syncTableCount();
    }
    function addTableRow(){
        let id = $(this).attr("data-id");
        let table = $(`.MainTable[data-id=${id}]`);
        let ColumnID = table.children("[data-name=Column]").length;
        table.append(Column(ColumnID));
    }
    function deleteTableRow(){
        $(this).closest("[data-name=Column]").remove();
    }
    
    $().ready(function(){
        $("#ModeDiv > button").click(createSelectTable);
    });
    function createSelectTable(){
        renderSelectTable(mode = $(this).attr("data-mode"));
    }
    function renderSelectTable(mode){
        clear($("#SelectTableDiv"));
        clear($("#JoinTableDiv"));
        clear($("#JoinOnTableDiv"));
        $.each($(".MainTable"),function(i,e){
            e = $(e);
            let id = $(e).attr("data-id");
            let table = Table(id,"SelectTable");
            let value = $(e).children("[type=text]").val();
            TableAppendText(table,value);
            $("#SelectTableDiv").append(table);
            
            if(mode == "multi"){
                header = multiSelectTableHeader(id);
                $("#JoinOnBtnDiv").html(`<button class="btn btn-warning" id="JoinOnBtn"> On 條件</button>`);
                $("#WhereTableBtnDiv").html(`<button class="btn btn-warning" id="WhereBtn"> Where 條件</button>`);
            }else if(mode == "simple"){
                header = simpleSelectTableHeader(id);
                $("#JoinOnBtnDiv").html(``);
                $("#WhereTableBtnDiv").html(`<button class="btn btn-warning" id="WhereBtn"> Where 條件</button>`);
                
            }
            table.prepend(header);
        });
    }
    let Table = function(id,TableName){
        return $($.parseHTML(`
        <div class="col-md-3 Table ${TableName}" data-id="${id}">
        </div>`));
    }
    let multiSelectTableHeader = function(id){
        return $($.parseHTML(`
            <input type="radio" name="SelectTable" data-id=${id} data-mode="multi">
        `));
    }
    let simpleSelectTableHeader = function(id){
        return $($.parseHTML(`
            <input type="radio" name="SelectTable" data-id=${id} data-mode="simple">
        `));
    }
    $().ready(function(){
        $("body").on("click",`[type="radio"][name="SelectTable"]`,isNeedJoinTable);
    });
    function isNeedJoinTable(){
        if(mode == "simple") return ;
        RenderJoinTable($(this));
    }
    function RenderJoinTable(dom){
        clear($("#JoinTableDiv"));
        clear($("#JoinOnTableDiv"));
        $.each($(".MainTable"),function(i,e){
            e = $(e);
            let id = $(e).attr("data-id");
            let table = Table(id,"JoinTable");
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
            let table = Table(id,"JoinOnTable");
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
    function TableAppendText(table,val){
        table.append("<text></text>");
        table.children("text").text(val);
    }
    function clear(dom){
        dom.empty();
    }
    function remove(dom){
        dom.remove();
    }
})(this);