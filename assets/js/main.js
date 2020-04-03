;
(function (global){
    $().ready(function(){
        $("[data-name=addTable]").click(createMainTable);
        $("body").on("click","[data-name=deleteTable]",deleteMainTable);
        $("body").on("click","[data-name=addColumn]",addTableRow);
        $("body").on("click","[data-name=deleteColumn]",deleteTableRow);
    });
    let dataid = $(".MainTable")["length"];
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
        <div class="col-md-3 Table MainTable" data-id="${dataid}"> 
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
        $("#TableDiv").append(MainTable);
        syncTableCount();
    }
    function syncTableCount(){
        dataid = $(".MainTable")["length"];
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
        $(".SelectTable").click(createSelectTable);
    });
    function createSelectTable(){
        renderSelectTable($(this).attr("data-mode"));
    }
    function renderSelectTable(mode = "multi"){
        clearSelectTable();
        
        $.each($(".MainTable"),function(i,e){
            e = $(e);
            let id = $(e).attr("data-id");
            let table = SelectTable(id);
            let value = $(e).children("[type=text]").val();
            table.children("text").text(value);
            $("#SelectTableDiv").append(table);
            
            $.each(e.children("[data-name=Column]"),function(index,element){
                let column = SelectColumn(index);
                table.append(column);
                let value = $(element).children("[type=text]").val();
                column.children("text").text(value);
            });
            
            if(mode == "multi"){
                header = multiSelectTableHeader(id);
            }else if(mode == "simple"){
                header = simpleSelectTableHeader(id);
            }
            table.prepend(header);
        });
    }
    function clearSelectTable(){
        clear($("#SelectTableDiv"));
    }
    function clear(dom){
        dom.empty();
    }
    let SelectTable = function(id){
        return $($.parseHTML(`
        <div class="col-md-3 Table SelectTable" data-id="${id}"> 
            <text></text>
        </div>`));
    }
    let multiSelectTableHeader = function(id){
        return $($.parseHTML(`
            <input type="checkbox" name="SelectTable" data-id=${id}>
        `));
    }
    let simpleSelectTableHeader = function(id){
        return $($.parseHTML(`
            <input type="radio" name="SelectTable" data-id=${id}>
        `));
    }
    let SelectColumn = function(id){
        return $($.parseHTML(`
        <div class="container" data-name="Column" data-id=${id}>
            <!-- 資料欄位 -->
            <input type="checkbox">
            <text></text>
        </div>
        `));
    }
    let SelectJoinOption = function(){
        return $($.parseHTML(`<select>
        <option>Join</option>
        <option>Left Join</option>
        <option>Right Join</option>
        </select>`));
    }
})(this);