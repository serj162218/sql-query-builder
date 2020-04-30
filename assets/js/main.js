;
(function (global){
    $().ready(function(){
        createInputTable();
    });
    let dataid = 1;
    let TableList = {};
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
        table.element['input'].on("click","[data-name=finish]",{table},renderOnSelectTable);
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
    }
    function renderOnSelectTable(event){
        let table = event.data.table;
        if(dataid%2==0) $("#SelectTable").append(`<div class="row"></div>`);
        createInputTable();
        table.element['input'].appendTo('#SelectTable .row:last-child');
        table.element['input'].children("[data-name=finish]").remove();
        table.element['input'].children("[data-name=deleteTable]").css("display","inherit");
        table.element['input'].removeClass("col-md-3").addClass("col-md-6");
        
    }
    let InputTableElement = function(){
        return $($.parseHTML(`
        <div class="col-md-3 Table">
            <input type="text" data-name="TableName">
            <br>
            <button data-name="finish">☑</button>
            <button data-name="addColumn">+</button>
            <button data-name="deleteTable" style="display:none">-</button>
        </div>`));
    }
    function deleteTable(event){
        let table = event.data.table;
        table.delete();
    }
    function ChangeTableName(event){
        let table = event.data.table;
        table.name = $(this).val();
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
    function getObjectLength(object = {}){
        let length = Object.keys(object).length;
        return length;
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
    let InputColumnElement = function(){
        return $($.parseHTML(`
        <div class="container" data-name="Column">
            <!-- 資料欄位 -->
            <input type="text" class="col-md-10">
            <button data-name="deleteColumn">X</button>
        </div>
        `));
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
    /*
    let OperatorElement = function(){
        return $($.parseHTML(`
            <option v="="> = </option>
            <option v="!="> != </option>
            <option v=">="> >= </option>
            <option v=">"> > </option>
            <option v="<="> <= </option>
            <option v="<"> < </option>
            <option v="?"> 自訂 </option>
        `));
    };
    let JoinOption = function(id){
        return $($.parseHTML(`
            <select>
                <option data-v="1">Inner Join</option>
                <option data-v="2">Left Join</option>
                <option data-v="3">Right Join</option>
                <option data-v="4">Outer Join</option>
            </select>
        `));
    }
    */
})(this);