;
(function (global){
    $().ready(function(){
        $("[data-name=addTable]").click(createMainTable);
        $("body").on("click","[data-name=deleteTable]",deleteMainTable);
        $("body").on("click","[data-name=addColumn]",addTableRow);
        $("body").on("click","[data-name=deleteColumn]",deleteTableRow);
    });
    let dataid = 0;
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
        renderSelectTable($(this).attr("data-mode"));
    }
    function renderSelectTable(mode = "multi"){
        clear($("#SelectTableDiv"));
        clear($("#JoinTableDiv"));
        $.each($(".MainTable"),function(i,e){
            e = $(e);
            let id = $(e).attr("data-id");
            let table = Table(id,"SelectTable");
            let value = $(e).children("[type=text]").val();
            table.append("<text></text>");
            table.children("text").text(value);
            $("#SelectTableDiv").append(table);
            
            if(mode == "multi"){
                header = multiSelectTableHeader(id);
            }else if(mode == "simple"){
                header = simpleSelectTableHeader(id);
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
        if($(this).attr("data-mode") == "simple") return ;
        RenderJoinTable($(this));
    }
    function RenderJoinTable(dom){
        clear($("#JoinTableDiv"));
        $.each($(".MainTable"),function(i,e){
            e = $(e);
            if(dom.attr('data-id')==e.attr('data-id')) return;
            let id = $(e).attr("data-id");
            let table = Table(id,"JoinTable");
            let option = JoinOption(id);
            table.prepend(option);
            let value = $(e).children("[type=text]").val();
            table.append("<text></text>");
            table.children("text").text(value);
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
        <div class="container" data-name="Column" data-id=${id}>
            <!-- 資料欄位 -->
            <input type="checkbox" data-id=${id} data-name="JoinTable">
            <text></text>
        </div>
        `));
    }
    let JoinOption = function(id){
        return $($.parseHTML(`
        <span data-id=${id} data-name="JoinMode">
            <select>
                <option>不選取</option>
                <option>Inner Join</option>
                <option>Left Join</option>
                <option>Right Join</option>
            </select>
            <br>
        </span>`));
    }

    //--- 
    function clear(dom){
        dom.empty();
    }
    function remove(dom){
        dom.remove();
    }
})(this);