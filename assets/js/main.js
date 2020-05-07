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
            this.columnNums = 0;
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
        let element = InputTableElement(table.id);
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
                this.element[i].children("[data-type=text]").text(val);
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
        table.element['input'].find("[data-name=TableName]").before("<text>∷</text>");
        MainTableTitleDragAndDrop();
        MainTableColumnDragAndDrop();
        
    }
    let InputTableElement = function(tid){
        return $($.parseHTML(`
        <div class="col-md-3 Table">
            <span data-name="TitleDrag">
                <input type="text" data-name="TableName" tid="${tid}">
            </span>
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
        let ColumnID = table.columnNums++;
        let column = new Column();
        column.id = table.id;
        column.uid = ColumnID;
        column.setElement(InputColumnElement(column.id,column.uid),"input");
        table.pushColumn(column,ColumnID);
        table.element['input'].append(column.element['input']);
        InputColumnSetEvents(table,column);
        MainTableColumnDragAndDrop();
        column.element['input'].find("[data-name=ColumnName]").before("<text>∷</text>");
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
    let InputColumnElement = function(tid,uid){
        return $($.parseHTML(`
        <div class="container" data-name="Column">
            <span data-name="ColumnDrag">
                <input type="text" data-name="ColumnName"  class="col-md-10" tid=${tid} uid=${uid}>
            </span>
            <button data-name="deleteColumn">X</button>
        </div>
        `));
    }
    function InputColumnSetEvents(table,column){
        column.element["input"].on("change","[type=text]",{table,column},ColumnInputChange);
        column.element["input"].on("click","[data-name=deleteColumn]",{table,column},deleteColumn);
        column.RegisterNameListener(function(val){
            for(i in this.element){
                this.element[i].children("[data-type=text]").text(val);
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
    const MainTable = {
        tid: -1,
        uid: [],
    };
    let TitleMainElement = function(){
        return $($.parseHTML(`
        <span data-name=Title>
            <h5 data-type=text></h5>
            <button data-name="delete">X</button>
        </span>
        `));
    };
    let ColumnMainElement = function(){
        return $($.parseHTML(`
        <span data-name=Column>
            <h5 data-type=text></h5>
            <button data-name="delete">X</button>
        </span>
        `));
    };
    function MainTableTitleDragAndDrop(){
        const dropzone = $("#MainTableDiv [data-name=TitleDropZone]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=TitleDrag]',
            drop:function(event,ui){
                
                let drag = ui.draggable.children("input");
                let tid = drag.attr("tid");
                let table = TableList[tid];
                let origintid = MainTable['tid'];
                let element = TitleMainElement();
                element.children("[data-type=text]").text(drag.val());
                table.setElement(element,"main");
                if(origintid != tid && origintid != -1){
                    for(i in TableList[origintid]['columns']){
                        let col = TableList[origintid]['columns'][i];
                        if(typeof col.element['main'] != 'undefined')
                            col.element['main'].remove();
                    }
                    MainTable['uid'] = [];
                }
                MainTable['tid']=tid;
                $(event.target).children("[data-name=Title]").replaceWith(element);
            }
        });
        const draggable = $("#SelectTable [data-name=TitleDrag]");
        draggable.draggable({
            helper: 'clone',
            revert :true,
            revertDuration :false
        });
    }
    function MainTableColumnDragAndDrop(){
        const dropzone = $("#MainTableDiv [data-name=ColumnDropZone]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=ColumnDrag]',
            drop:function(event,ui){
                console.log("trigger");
                let drag = ui.draggable.children("input");
                let tid = drag.attr("tid");
                let uid = drag.attr("uid");
                let element = ColumnMainElement();
                let table = TableList[tid];
                let column = table['columns'][uid];
                if(MainTable['tid'] != tid) return;
                if($.inArray(uid,MainTable['uid']) != -1) return;
                MainTable['uid'].push(uid);
                element.children("[data-type=text]").text(drag.val());
                column.setElement(element,"main");
                $(event.target).append(element);
            }
        });
        const draggable = $("#SelectTable [data-name=ColumnDrag]");
        draggable.draggable({
            helper: 'clone',
            revert :true,
            revertDuration :false,
        });
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