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
        let element = TableInputElement(table.id);
        table.setElement(element,"input");
        InputTableSetEvents(table);
        dataid++;
        return table;
    }
    function InputTableSetEvents(table){
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
            let index = JoinTableTidList.indexOf(this.id);
            if(index != -1){
                let jointable = JoinTableList[index];
                jointable.element.children("[data-name=TitleDropZone]").droppable("enable");
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
        setMainTableDragAndDropEvent();
    }
    function setMainTableDragAndDropEvent(){
        MainTableTitleDragAndDrop();
        MainTableColumnDragAndDrop();
        MainTableConditionDragAndDrop();
    }
    let TableInputElement = function(tid){
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
        column.setElement(ColumnInputElement(column.id,column.uid),"input");
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
    let ColumnInputElement = function(tid,uid){
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
                let jointable = JoinTableList[index];
                if($.inArray(uid,jointable['uid']) != -1)
                    jointable['uid'].splice(jointable['uid'].indexOf(uid),1);
                if(typeof jointable['conditionUID'][uid] != 'undefined')
                    delete jointable['conditionUID'][uid];
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
                SetTitleMainElementEvents(element,table);
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
    function SetTitleMainElementEvents(element,table){
        $(element).on('click',{table},DeleteMainTableElement);
    }
    function DeleteMainTableElement(event){
        let table = event.data.table;
        table.element['main'].remove();
        delete table.element['main'];
        for(i in table.columns){
            let col = table.columns[i];
            if(typeof col.element['main'] != 'undefined'){
                col.element['main'].remove();
                delete col.element['main'];
            }
            if(typeof col.element['MainCondition'] != 'undefined'){
                col.element['MainCondition'].remove();
                delete col.element['MainCondition'];
            }
        }
        MainTable['uid'] = [];
        MainTable['conditionUID'] = [];
        MainTable['tid'] = -1;
    }
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
                SetColumnMainElementEvents(element,table,uid);
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
    function SetColumnMainElementEvents(element,table,uid){
        $(element).on('click',{table,uid},DeleteMainTableColumnElement);
    }
    function DeleteMainTableColumnElement(event){
        let table = event.data.table;
        let uid = event.data.uid;
        let column = table['columns'][uid];
        {
            let index =  MainTable['uid'].indexOf(uid)
            if(index != -1) MainTable['uid'].splice(index,1);
        }
        column.element['main'].remove();
        delete column.element['main'];
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
                SetConditionMainElementEvents(element,table,uid);
            }
        });
        const draggable = $("#SelectTable [data-name=ColumnDrag]");
        draggable.draggable({
            helper: 'clone',
            revert :true,
            revertDuration :false,
        });
    }
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

    function SetConditionMainElementEvents(element,table,uid){
        $(element).on('click',{table,uid},DeleteMainTableConditionElement);
    }
    function DeleteMainTableConditionElement(event){
        let table = event.data.table;
        let uid = event.data.uid;
        let column = table['columns'][uid];
        {
            let index =  MainTable['conditionUID'].indexOf(uid)
            if(index != -1) MainTable['conditionUID'].splice(index,1);
        }
        column.element['MainCondition'].remove();
        delete column.element['MainCondition'];
    }
    class JoinTable{
        static tid = 0;
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
        table.element = RenderJoinTable(table.tid);
        setJoinTableDragAndDropEvent(table);
    }
    function createNewJoinTable(){
        let table =  new JoinTable(--JoinTable.tid);
        JoinTableList.push(table);
        JoinTableTidList.push(table.tid);
        return table;
    }
    function RenderJoinTable(tid){
        let element = JoinTableElement(tid);
        $("#JoinTableDiv .Table").append(element);
        return element;
    }
    JoinTableElement = function(tid){
        return $($.parseHTML(`
        <div class="JoinTable" data-id=${tid}>
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
        const dropzone = jointable.element.children("[data-name=TitleDropZone]");
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
        const dropzone = jointable.element.children("[data-name=ColumnDropZone]");
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
        const dropzone = jointable.element.children("[data-name=Condition]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=ColumnDrag]',
            drop:function(event,ui){
                let drag = ui.draggable.children("input");
                let tid = Number(drag.attr("tid"));
                let uid = Number(drag.attr("uid"));
                let element = ConditionJoinElement(tid,uid);
                let table = TableList[tid];
                let column = table['columns'][uid];
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
    let ConditionJoinElement = function(tid,uid){
        return $($.parseHTML(`
        <span data-name=Column>
            <text data-type="text"></text>
            <span data-name="compareDropZone" tid=${tid} uid=${uid}>= <t> <span class="hideIfBeforeText">?</span> </t></span>
            <button data-name="delete">X</button>
            <br>
        </span>
        `));
    }
    function setJoinTableConditionCompareDragAndDropEvent(jointable){
        const dropzone = jointable.element.find("[data-name=compareDropZone]");
        dropzone.droppable({
            accept: '#SelectTable [data-name=ColumnDrag]',
            drop:function(event,ui){
                let drag = ui.draggable.children("input");
                let dragtid = Number(drag.attr("tid"));
                let draguid = Number(drag.attr("uid"));
                let tid = Number($(event.target).attr("tid"));
                let uid = Number($(event.target).attr("uid"));
                let elementForColumn = ConditionCompareElement();
                let elementForTable = ConditionCompareElement();
                let table = TableList[dragtid];
                let column = table['columns'][draguid];
                let compareCondition = `${dragtid}-${draguid}`;
                if(tid == dragtid) return;
                if(jointable['conditionUID'][uid] != null) return;
                jointable['conditionUID'][uid] = compareCondition;
                elementForColumn.children("[data-type=text]").text(drag.val());
                elementForTable.children("[data-type=text]").text(table.name);
                column.setElement(elementForColumn,`JoinCompareCondition${tid}-${uid}`);
                table.setElement(elementForTable,`JoinCompareCondition${tid}-${uid}`);
                $(event.target).children("t").prepend(elementForTable,elementForColumn);
                $(event.target).droppable('disable');
            },
            tolerance :'pointer'
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