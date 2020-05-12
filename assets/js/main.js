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
            for(i in this.element){
                this.element[i].remove();
            }
            for(i in this.columns){
                let column = this.columns[i];
                column.delete();
            }

            if(MainTable.tid == this.id){
                MainTable.tid = -1
            }
            delete TableList[this.id];
            let index = JoinTableTidList.indexOf(this.id);
            if(index != -1){
                JoinTableList[index].element.remove();
                delete JoinTableList[index];
            }
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
        setMainTableDragAndDropEvent();
    }
    function setMainTableDragAndDropEvent(){
        MainTableTitleDragAndDrop();
        MainTableColumnDragAndDrop();
        MainTableConditionDragAndDrop();
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
            //TODO 當TableName改變時，改變此Table的elements裡面的全部element的TableName
            for(i in this.element){
                this.element[i].remove();
            }
            let uid = column.uid;
            if(MainTable.tid == table.id)
                if($.inArray(uid,MainTable['uid']) != -1)
                    MainTable['uid'].splice(MainTable['uid'].indexOf(uid),1);
            
            if($.inArray(table.id,JoinTableTidList) != -1){
                let index = JoinTableTidList.indexOf(table.id);
                JoinTableTidList.splice(index,1);
                let jointable = JoinTableList[index];
                if($.inArray(uid,jointable['uid']) != -1)
                    jointable['uid'].splice(jointable['uid'].indexOf(uid),1);
                if(typeof jointable['ConditionUID'][uid] != 'undefined')
                    delete jointable['ConditionUID'][uid];
                
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
        conditionUID:[],
    };
    function MainTableTitleDragAndDrop(){
        const dropzone = $("#MainTableDiv [data-name=TitleDropZone]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=TitleDrag]',
            drop:function(event,ui){
                
                let drag = ui.draggable.children("input");
                let tid = Number(drag.attr("tid"));
                let table = TableList[tid];
                let origintid = MainTable['tid'];
                let element = TitleMainElement();
                if(JoinTableTidList.indexOf(tid) != -1) return;
                element.children("[data-type=text]").text(drag.val());
                table.setElement(element,"main");
                if(origintid != tid && origintid != -1){
                    let OriginTable = TableList[origintid];
                    for(i in OriginTable['columns']){
                        OriginTable.element['main'].remove();
                        let col = OriginTable['columns'][i];
                        if(typeof col.element['main'] != 'undefined')
                            col.element['main'].remove();
                        if(typeof col.element['MainCondition'] != 'undefined')
                            col.element['MainCondition'].remove();
                    }
                    MainTable['uid'] = [];
                    MainTable['conditionUID'] = [];
                }
                MainTable['tid']=tid;
                $(event.target).children("[data-name=TitleSpan]").html(element);
            },
            tolerance :'touch'
        });
        const draggable = $("#SelectTable [data-name=TitleDrag]");
        draggable.draggable({
            helper: 'clone',
            revert :true,
            revertDuration :false
        });
    }
    let TitleMainElement = function(){
        return $($.parseHTML(`
        <span data-name=Title>
            <h5 data-type=text></h5>
            <button data-name="delete">X</button>
        </span>
        `));
    };
    function MainTableColumnDragAndDrop(){
        const dropzone = $("#MainTableDiv [data-name=ColumnDropZone]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=ColumnDrag]',
            drop:function(event,ui){
                let drag = ui.draggable.children("input");
                let tid = Number(drag.attr("tid"));
                let uid = Number(drag.attr("uid"));
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
    let ColumnMainElement = function(){
        return $($.parseHTML(`
        <span data-name=Column>
            <h5 data-type=text></h5>
            <button data-name="delete">X</button>
        </span>
        `));
    };
    let ConditionMainElement = function(){
        return $($.parseHTML(`
        <span data-name=Column>
            <text data-type="text"></text>
            = ? 
            <button data-name="delete">X</button>
            <br>
        </span>
        `));
    }
    function MainTableConditionDragAndDrop(){
        const dropzone = $("#MainTableDiv [data-name=Condition]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=ColumnDrag]',
            drop:function(event,ui){
                let drag = ui.draggable.children("input");
                let tid = Number(drag.attr("tid"));
                let uid = Number(drag.attr("uid"));
                let element = ConditionMainElement();
                let table = TableList[tid];
                let column = table['columns'][uid];
                if(MainTable['tid'] != tid) return;
                if($.inArray(uid,MainTable['conditionUID']) != -1) return;
                MainTable['conditionUID'].push(uid);
                element.children("[data-type=text]").text(drag.val());
                column.setElement(element,"MainCondition");
                $(event.target).children("[data-name=ConditionText]").after(element);
            }
        });
        const draggable = $("#SelectTable [data-name=ColumnDrag]");
        draggable.draggable({
            helper: 'clone',
            revert :true,
            revertDuration :false,
        });
    }

    class JoinTable{
        static tid = 0;
        id;
        tid;
        uid;
        conditionUID;
        joinMode;
        element;
        constructor(tid){
            this.tid = tid;
            this.uid = [];
            this.conditionUID = {};
            this.joinMode = '';
        }
    }
    const JoinTableTidList = [];
    const JoinTableList = [];

    $().ready(function(){
        $("#JoinTableDiv [data-name=addColumn]").click(createNewJoinTableModal);
    });
    function createNewJoinTableModal(){
        let table = createNewJoinTable();
        table.element = RenderJoinTable(table.id);
        setJoinTableDragAndDropEvent(table);
    }
    function createNewJoinTable(){
        let table =  new JoinTable(--JoinTable.tid);
        JoinTableList.push(table);
        JoinTableTidList.push(table.tid);
        return table;
    }
    function RenderJoinTable(id){
        let element = JoinTableElement(id);
        $("#JoinTableDiv .Table").append(element);
        return element;
    }
    JoinTableElement = function(id){
        return $($.parseHTML(`
        <div class="JoinTable" data-id=${id}>
            <div class="hasHr" data-name="TitleDropZone">
                <span>資料表名稱</span>
                <button data-name="deleteTable">-</button>
                <span data-name="TitleSpan"></span>
            </div>
            <div class="hasHr" data-name="ColumnDropZone">
                <span>要查詢的欄位</span>
                <br>
                <br>
            </div>
            <div class="hasHr" data-name="Condition">
                <span data-name="ConditionText">
                    條件
                    <br>
                    <br>
                </span>
            </div>
        </div>
        `));
    }
    function setJoinTableDragAndDropEvent(table){
        setJoinTableTitleDragAndDrop(table);
        setJoinTableColumnDragAndDrop(table);
        setJoinTableConditionDragAndDrop(table);
        
    }
    function setJoinTableTitleDragAndDrop(jointable){
        const dropzone = $("#JoinTableDiv [data-name=TitleDropZone]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=TitleDrag]',
            drop:function(event,ui){
                let drag = ui.draggable.children("input");
                let tid = Number(drag.attr("tid"));
                let table = TableList[tid];
                let element = TitleJoinElement();
                if(MainTable['tid'] == tid) return;
                element.children("[data-type=text]").text(drag.val());
                table.setElement(element,"join");
                JoinTableTidList[JoinTableTidList.indexOf(jointable['tid'])] = tid;
                jointable['tid']=tid;
                $(event.target).children("[data-name=TitleSpan]").html(element);
                $(event.target).droppable('disable');
            },
            tolerance :'touch'
        });
        const draggable = $("#SelectTable [data-name=TitleDrag]");
        draggable.draggable({
            helper: 'clone',
            revert :true,
            revertDuration :false
        });
    }
    let TitleJoinElement = function(){
        return $($.parseHTML(`
        <span data-name=Title>
            <h5 data-type=text></h5>
        </span>
        `));
    }
    function setJoinTableColumnDragAndDrop(jointable){
        const dropzone = $("#JoinTableDiv [data-name=ColumnDropZone]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=ColumnDrag]',
            drop:function(event,ui){
                let drag = ui.draggable.children("input");
                let tid = Number(drag.attr("tid"));
                let uid = Number(drag.attr("uid"));
                let element = ColumnJoinElement();
                let table = TableList[tid];
                let column = table['columns'][uid];
                if(jointable['tid'] != tid) return;
                if($.inArray(uid,jointable['uid']) != -1) return;
                jointable['uid'].push(uid);
                element.children("[data-type=text]").text(drag.val());
                column.setElement(element,"join");
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
    let ColumnJoinElement = function(){
        return $($.parseHTML(`
        <span data-name=Column>
            <h5 data-type=text></h5>
            <button data-name="delete">X</button>
        </span>
        `));
    }
    function setJoinTableConditionDragAndDrop(jointable){
        const dropzone = $("#JoinTableDiv [data-name=Condition]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=ColumnDrag]',
            drop:function(event,ui){
                let drag = ui.draggable.children("input");
                let tid = Number(drag.attr("tid"));
                let uid = Number(drag.attr("uid"));
                let element = ConditionJoinElement();
                let table = TableList[tid];
                let column = table['columns'][uid];
                console.log(jointable['conditionUID']);
                if(jointable['tid'] != tid) return;
                if(typeof jointable['conditionUID'][uid] != 'undefined') return;
                jointable['conditionUID'][uid]=null;
                element.children("[data-type=text]").text(drag.val());
                column.setElement(element,"JoinCondition");
                $(event.target).children("[data-name=ConditionText]").after(element);
                setJoinTableConditionCompareDragAndDropEvent(jointable);
            }
        });
        const draggable = $("#SelectTable [data-name=ColumnDrag]");
        draggable.draggable({
            helper: 'clone',
            revert :true,
            revertDuration :false,
        });
    }
    let ConditionJoinElement = function(){
        return $($.parseHTML(`
        <span data-name=Column>
            <text data-type="text"></text>
            <span data-name="compareDropZone">= <t> <span class="hideIfBeforeText">?</span> </t></span>
            <button data-name="delete">X</button>
            <br>
        </span>
        `));
    }
    function setJoinTableConditionCompareDragAndDropEvent(jointable){
        const dropzone = $("[data-name=Column] [data-name=compareDropZone]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=ColumnDrag]',
            drop:function(event,ui){
                let drag = ui.draggable.children("input");
                let tid = Number(drag.attr("tid"));
                let uid = Number(drag.attr("uid"));
                let elementForColumn = ConditionCompareElement();
                let elementForTable = ConditionCompareElement();
                let table = TableList[tid];
                let column = table['columns'][uid];
                let compareCondition = `${tid}-${uid}`;
                if(jointable['tid'] == tid) return;
                if(jointable['conditionUID'][uid] != null) return;
                jointable['conditionUID'][uid] = compareCondition;
                elementForColumn.children("[data-type=text]").text(drag.val());
                elementForTable.children("[data-type=text]").text(table.name+".");
                column.setElement(elementForColumn,"JoinCompareCondition");
                table.setElement(elementForTable,"JoinCompareCondition");
                $(event.target).children("t").prepend(elementForTable,elementForColumn);
                $("[data-name=Column] [data-name=compareDropZone]").droppable('disable');
            },
            tolerance :'touch'
        });
        const draggable = $("#SelectTable [data-name=ColumnDrag]");
        draggable.draggable({
            helper: 'clone',
            revert :true,
            revertDuration :false,
        });
    }
    let ConditionCompareElement = function(){
        return $($.parseHTML(`
            <span><text data-type='text'></text></span>
        `));
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
                <option>Inner Join</option>
                <option>Left Join</option>
                <option>Right Join</option>
                <option>Outer Join</option>
            </select>
        `));
    }
    */
})(this);