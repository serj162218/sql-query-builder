;
(function (global){
    $().ready(function(){
        $("[data-name=addTable]").click(createTable);
        $("body").on("click","[data-name=addColumn]",addTableRow);
        $("body").on("click","[data-name=deleteColumn]",deleteTableRow);
    });
    let dataid = $(".MainTable")["length"];
    function createTable(){
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
        return `
        <div class="col-md-3 Table MainTable" data-id="${dataid}"> 
            <input type="text" data-name="TableName">
            ${Table()}
        </div>`;
    }
    let Table = function(){
        return `
        <!-- 資料表的地方 -->
        <button data-name="addColumn" data-id="${dataid}" data-type="Main">+</button> <!-- 新增資料欄位按鈕 -->
        <button data-name="deleteTable" data-id="${dataid}" data-type="Main">-</button> <!-- 刪除資料表按鈕 -->
        ${Column()}`;
    }
    let Column = function(){
        return `
        <div class="container" data-name="Column">
            <!-- 資料欄位 -->
            <input type="checkbox" class="col-md-2">
            <input type="text" class="col-md-10">
            <button data-name="deleteColumn">X</button>
        </div>
        `;
    }
    function addMainTable(){
        $("#TableDiv").append(MainTable);
        syncTableCount();
    }
    function syncTableCount(){
        dataid = $(".MainTable")["length"];
    }
    function addTableRow(){
        let id = $(this).attr("data-id");
        $(`.MainTable[data-id=${id}]`).append(Column);
    }
    function deleteTableRow(){
        $(this).closest("[data-name=Column]").remove();
    }
})(this);