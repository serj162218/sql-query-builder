;
(function (global){
    $().ready(function(){
        $("[data-name=addTable]").click(createTable);
    });
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
        <div class="col-md-3 Table MainTable" data-id="${$(".MainTable")["length"]}"> 
            ${Table()}
        </div>`;
    }
    let Table = function(){
        return `
        <!-- 資料表的地方 -->
        <i class="fas fa-plus-square" data-name="addColumn" data-id="1" data-type="main"></i> <!-- 新增資料欄位按鈕 -->
        <div class="container">
            <!-- 資料欄位 -->
            <input type="checkbox" class="col-md-2"></input>
            <input type="text" class="col-md-10">
        </div>`;
    }
    function addMainTable(){
        $("#TableDiv").append(MainTable);
    }
})(this);