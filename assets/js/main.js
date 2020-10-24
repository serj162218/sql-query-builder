;
(function (global){
    let TableList = {};
    class Table{
        static id;
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
    Table.id = 1;
    $().ready(function(){
        createInputTable();
    });
    function createInputTable(){
        // 新建資料表
        let table = createTable();
        $("#InputTableDiv").append(table.element['input']);
    }
    function createTable(){
        let table = new Table();
        table.id = Table.id;
        TableList[Table.id] = table;
        let element = TableInputElement(table.id);
        let tabletitle = TableTitleElement(table.id);
        table.setElement(element,"input");
        table.setElement(tabletitle,"title");
        InputTableSetEvents(table);
        Table.id++;
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
                JoinTableList.splice(JoinTableList.indexOf(index),1);
                JoinTableTidList.splice(JoinTableTidList.indexOf(index),1);
                jointable.element.remove();
                delete jointable;
            }
            delete TableList[this.id];
        });
    }
    function renderOnSelectTable(event){
        let table = event.data.table;
        createInputTable(); 
        table.element['input'].appendTo('#SelectTable .tab-content');
        table.element['input'].children("[data-name=finish]").remove();
        table.element['input'].children("[data-name=deleteTable]").css("display","inherit");
        table.element['input'].removeClass("col-md-3").addClass("col-md-6");
        table.element['input'].find("[data-name=TableName]").before("<text class='HideButton TableButton' type='table'>⬅</text>");
        $("#SelectTable .nav-tabs").append(table.element['title']);
    }
    let TableInputElement = function(tid){
        return $($.parseHTML(`
        
        <div class="tab-pane fade show col-md-3 Table" id="table-${tid}" role="tabpanel" aria-labelledby="table-${tid}-tab">
            <span data-name="TitleDrag">
                <input type="text" data-name="TableName" tid="${tid}">
            </span>
            <br>
            <button data-name="finish">☑</button>
            <button data-name="addColumn">+</button>
            <button data-name="deleteTable" style="display:none">-</button>
        </div>`));
    }
    let TableTitleElement = function(tid){
        return $($.parseHTML(`
        <li class="nav-item">
            <a class="nav-link" id="${tid}-tab" data-toggle="tab" href="#table-${tid}" data-type=text role="tab" aria-controls="table-${tid}" aria-selected="false"></a>                    
        </li>
        `));
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
        column.element['input'].find("[data-name=ColumnName]").before("<text class='HideButton TableButton' type='column'>⬅</text>");
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
            let JoinCompareCondition = [];
            for(i in this.element){
                if(i.includes("JoinCompareCondition")) JoinCompareCondition.push(i.replace("JoinCompareCondition",""));
                this.element[i].remove();
            }
            
            JoinCompareCondition.forEach(function(e){
                let [tableX,columnX] = e.split('-');
                let index = JoinTableTidList.indexOf(Number(tableX));
                let jointable = JoinTableList[index];
                jointable['conditionUID'][columnX] = "?";

                table.element[`JoinCompareCondition${e}`].remove();
                delete table.element[`JoinCompareCondition${e}`];

            });

            let uid = column.uid;
            if(MainTable.tid == table.id){
                if($.inArray(uid,MainTable['uid']) != -1)
                    MainTable['uid'].splice(MainTable['uid'].indexOf(uid),1);
                if(typeof MainTable['conditionUID'][uid] != 'undefined')
                    delete MainTable['conditionUID'][uid];
                    
            }
            
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
        conditionUID:{},
    };
    const SelectedElement = {
        type : null,
        element : $(), //null
        Table : null,
    };
    $().ready(function(){
        setTitleSelectedEvent();
        setColumnSelectedEvent();
        setConditionSelectedEvent();
        setCompareSelectedEvent();
        $("body").on("click",".TableButton",AddNameToTable);
    });
    function setTitleSelectedEvent(){
        $("body").on("click","[data-name=TitleDropZone]",function(){
            let element = $(this);
            ResetSelectedElementClass(element);
            SelectedElement.type = "title";
            SelectedElement.element = element;
            SelectedElement.Table = element.parent();
            $("[data-name=TableName]").prev("text").removeClass("HideButton");
            $("[data-name=ColumnName]").prev("text").addClass("HideButton");
        });
    }
    function setColumnSelectedEvent(){
        $("body").on("click","[data-name=ColumnDropZone]",function(){
            let element = $(this);
            ResetSelectedElementClass(element);
            SelectedElement.type = "column";
            SelectedElement.element = element;
            SelectedElement.Table = element.parent();
            $("[data-name=ColumnName]").prev("text").removeClass("HideButton");
            $("[data-name=TableName]").prev("text").addClass("HideButton");
        });
    }
    function setConditionSelectedEvent(){
        $("body").on("click","[data-name=Condition]",function(){
            let element = $(this);
            ResetSelectedElementClass(element);
            SelectedElement.type = "condition";
            SelectedElement.element = element;
            SelectedElement.Table = element.parent();
            $("[data-name=ColumnName]").prev("text").removeClass("HideButton");
            $("[data-name=TableName]").prev("text").addClass("HideButton");
        });
    }
    function setCompareSelectedEvent(){
        $("body").on("click","[data-name=compareDropZone]",function(event){
            let element = $(this);
            ResetSelectedElementClass(element);
            SelectedElement.type = "compare";
            SelectedElement.element = element;
            SelectedElement.Table = element.closest(".JoinTable");
            $("[data-name=ColumnName]").prev("text").removeClass("HideButton");
            $("[data-name=TableName]").prev("text").addClass("HideButton");
            event.stopPropagation(); //Stop triggering ConditionSelctedEvent
        });
    }
    function ResetSelectedElementClass(element){
        SelectedElement.element.removeClass("isSelected");
        element.addClass("isSelected");
    }
    function AddNameToTable(){
        let type = $(this).attr("type");
        if(type == "table"){
            if(isMainTable()){
                SetMainTableTitle(this);
            }else{
                SetJoinTableTitle(this)
            }
        }else if(type == "column"){
            if(SelectedElement.type == "column"){
                if(isMainTable()){
                    SetMainTableColumn(this);
                }
                else{
                    SetJoinTableColumn(this);
                }
            }else if(SelectedElement.type == "condition"){
                if(isMainTable()){
                    SetMainTableCondition(this);
                }else{
                    SetJoinTableCondition(this);
                }
            }else if(SelectedElement.type == "compare"){
                if(isMainTable()){
                    // MainTable don't have compare
                }else{
                    SetJoinTableCompare(this);
                }
            }
        }
    }
    function isMainTable(){
        return SelectedElement.Table.is($("#MainTableDiv").find(".Table"));
    }
    function SetMainTableTitle(ev){
        let drag = $(ev).next();
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
            MainTable['conditionUID'] = {};
        }
        MainTable['tid']=tid;
        $(SelectedElement.element).children("[data-name=TitleSpan]").html(element);
        SetTitleMainElementEvents(element,table);
    }
    function SetJoinTableTitle(ev){
        let drag = $(ev).next();
        let tid = Number(drag.attr("tid"));
        let table = TableList[tid];
        let jointable = JoinTableList.find(function(item){
            return item.tid == Number(SelectedElement.Table.eq(0).attr("data-id"));
        });
        if(jointable == undefined) return;
        let element = TitleJoinElement();
        if(MainTable['tid'] == tid) return;
        if(JoinTableTidList.indexOf(tid) != -1) return;
        element.children("[data-type=text]").text(drag.val());
        table.setElement(element,"join");
        JoinTableTidList[JoinTableTidList.indexOf(jointable['tid'])] = tid;
        jointable['tid']=tid;
        $(SelectedElement.element).children("[data-name=TitleSpan]").html(element);
        SelectedElement.Table.eq(0).attr("data-id",jointable.tid);
    }
    function SetMainTableColumn(ev){
        let drag = $(ev).next();
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
        $(SelectedElement.element).append(element);
        SetColumnMainElementEvents(element,table,uid);
    }
    function SetJoinTableColumn(ev){
        let drag = $(ev).next();
        let tid = Number(drag.attr("tid"));
        let uid = Number(drag.attr("uid"));
        let element = ColumnJoinElement();
        let table = TableList[tid];
        let jointable = JoinTableList.find(function(item){
            return item.tid == Number(SelectedElement.Table.eq(0).attr("data-id"));
        });
        let column = table['columns'][uid];
        if(jointable['tid'] != tid) return;
        if($.inArray(uid,jointable['uid']) != -1) return;
        jointable['uid'].push(uid);
        element.children("[data-type=text]").text(drag.val());
        column.setElement(element,"join");
        $(SelectedElement.element).append(element);
        SetColumnJoinElementEvents(element,jointable,table,uid);
    }
    function SetMainTableCondition(ev){
        let drag = $(ev).next();
        let tid = Number(drag.attr("tid"));
        let uid = Number(drag.attr("uid"));
        let element = ConditionMainElement();
        let table = TableList[tid];
        let column = table['columns'][uid];
        if(MainTable['tid'] != tid) return;
        if(typeof MainTable['conditionUID'][uid] != 'undefined') return;
        MainTable['conditionUID'][uid] = "?";
        element.children("[data-type=text]").text(drag.val());
        column.setElement(element,"MainCondition");
        $(SelectedElement.element).children("[data-name=ConditionText]").after(element);
        SetConditionMainElementEvents(element,table,uid);
    }
    function SetJoinTableCondition(ev){
        let drag = $(ev).next();
        let tid = Number(drag.attr("tid"));
        let uid = Number(drag.attr("uid"));
        let element = ConditionJoinElement(tid,uid);
        let table = TableList[tid];
        let column = table['columns'][uid];
        let jointable = JoinTableList.find(function(item){
            return item.tid == Number(SelectedElement.Table.eq(0).attr("data-id"));
        });
        if(jointable['tid'] != tid) return;
        if(typeof jointable['conditionUID'][uid] != 'undefined') return;
        jointable['conditionUID'][uid]="?";
        element.children("[data-type=text]").text(drag.val());
        column.setElement(element,"JoinCondition");
        $(SelectedElement.element).children("[data-name=ConditionText]").after(element);
        SetConditionJoinElementEvents(element,jointable,table,uid);
    }
    function SetJoinTableCompare(ev){
        let drag = $(ev).next();
        let dragtid = Number(drag.attr("tid"));
        let draguid = Number(drag.attr("uid"));
        let tid = Number($(SelectedElement.element).attr("tid"));
        let uid = Number($(SelectedElement.element).attr("uid"));
        let jointable = JoinTableList.find(function(item){
            return item.tid == Number(SelectedElement.Table.eq(0).attr("data-id"));
        });
        let elementForColumn = ConditionCompareElement();
        let elementForTable = ConditionCompareElement();
        let table = TableList[dragtid];
        let column = table['columns'][draguid];
        let compareCondition = [dragtid,draguid];
        if(tid == dragtid) return;
        if(MainTable.tid != dragtid && JoinTableTidList.indexOf(dragtid) == -1) return;
        jointable['conditionUID'][uid] = compareCondition;
        elementForColumn.children("[data-type=text]").text(drag.val());
        elementForTable.children("[data-type=text]").text(table.name);
        column.setElement(elementForColumn,`JoinCompareCondition${tid}-${uid}`);
        table.setElement(elementForTable,`JoinCompareCondition${tid}-${uid}`);
        $(SelectedElement.element).children("t").prepend(elementForTable,elementForColumn);
        $(SelectedElement.element).find(".ConditionParameter").css("display","none");
        $(SelectedElement.element).attr("data-name","");
        $(SelectedElement.element.closest("[data-name=Condition]")).trigger("click");
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
        $(element.find("[data-name='delete']")).on('click',{table},DeleteMainTableElement);
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
        MainTable['conditionUID'] = {};
        MainTable['tid'] = -1;
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
        $(element.find("[data-name='delete']")).on('click',{table,uid},DeleteMainTableColumnElement);
    }
    function DeleteMainTableColumnElement(event){
        let table = event.data.table;
        let uid = event.data.uid;
        let column = table['columns'][uid];
        let index =  MainTable['uid'].indexOf(uid)
        if(index != -1) MainTable['uid'].splice(index,1);
        column.element['main'].remove();
        delete column.element['main'];
    }
    let ConditionMainElement = function(){
        return $($.parseHTML(`
        <span data-name=Column>
            <text data-type="text"></text>
             = <input type="text" class="ConditionParameter">
            <button data-name="delete">X</button>
            <br>
        </span>
        `));
    }

    function SetConditionMainElementEvents(element,table,uid){
        $(element).find("[data-name='delete']").on('click',{table,uid},DeleteMainTableConditionElement);
        $(element).find(".ConditionParameter").on('change',{uid},ChangeMainTableConditionParameter);

    }
    function DeleteMainTableConditionElement(event){
        let table = event.data.table;
        let uid = event.data.uid;
        let column = table['columns'][uid];
        delete MainTable['conditionUID'][uid];
        column.element['MainCondition'].remove();
        delete column.element['MainCondition'];
    }
    function ChangeMainTableConditionParameter(event){
        let uid = event.data.uid;
        MainTable['conditionUID'][uid] = $(this).val();
    }
    class JoinTable{
        static tid = 0;
        tid;
        uid;
        conditionUID;
        JoinMode;
        element;
        constructor(tid){
            this.tid = tid;
            this.uid = [];
            this.conditionUID = {};
            this.JoinMode = 'Inner Join';
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
        SetJoinTableElementEvents(table.element,table);
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
    let JoinTableElement = function(tid){
        return $($.parseHTML(`
        <div class="JoinTable" data-id=${tid}>
            <div class="hasHr" data-name="TitleDropZone">
                <span>資料表名稱${JoinOption(tid)}</span>
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
    let JoinOption = function(id){
        return `
            <select data-tid=${id} data-name=JoinMode>
                <option data-mode="Inner Join">交集</option>
                <option data-mode="Left Join">差集-以主資料表為主</option>
                <option data-mode="Right Join">差集-以此資料表為主</option>
                <option data-mode="Outer Join">聯集</option>
            </select>`
    }
    function SetJoinTableElementEvents(element,jointable){
        $(element).find("[data-name=deleteTable]").on('click',{element,jointable},DeleteJoinTableElement);
        $(element).find("[data-name=JoinMode]").on('change',{element,jointable},ChangeJoinTableJoinMode);
    }
    function DeleteJoinTableElement(event){
        let jointable = event.data.jointable;
        let element = event.data.element;
        let tid = jointable.tid;
        if(tid > -1 ){ //jointable已被放入其他資料表的資料 要清除關於此資料表的join資料
            let table = TableList[tid];
            if(typeof table.element['join'] != 'undefined') delete table.element['join'];
            for(i in table.columns){
                let col = table.columns[i];
                if(typeof col.element['join'] != 'undefined') delete col.element['join'];
                if(typeof col.element['JoinCondition'] != 'undefined') delete col.element['JoinCondition'];
            }
        }
        for(uid in jointable.conditionUID){ //jointable的條件已被放入關聯的資料表資料 要清除關於此資料表的JoinCompareCondition
            if(typeof jointable.conditionUID[uid] == "string") continue;
            let [tabletid,tableuid] = jointable.conditionUID[uid];
            let table = TableList[tabletid];
            let column = table.columns[tableuid];
            delete table.element[`JoinCompareCondition${tid}-${uid}`];
            delete column.element[`JoinCompareCondition${tid}-${uid}`];
        }
        let index = JoinTableTidList.indexOf(tid);
        JoinTableTidList.splice(index,1);
        JoinTableList.splice(index,1);
        element.remove();
        delete jointable;
    }
    function ChangeJoinTableJoinMode(event){
        let mode = $(this).children("option:selected").attr("data-mode");
        let table = event.data.jointable;
        table.JoinMode = mode;
    }
    let TitleJoinElement = function(){
        return $($.parseHTML(`
        <span data-name=Title>
            <h5 data-type=text></h5>
        </span>
        `));
    }
    let ColumnJoinElement = function(){
        return $($.parseHTML(`
        <span data-name=Column>
            <h5 data-type=text></h5>
            <button data-name="delete">X</button>
        </span>
        `));
    }
    function SetColumnJoinElementEvents(element,jointable,table,uid){
        $(element.find("[data-name='delete']")).on('click',{jointable,table,uid},DeleteColumnJoinColumnElement);
    }
    function DeleteColumnJoinColumnElement(event){
        let jointable = event.data.jointable;
        let table = event.data.table;
        let uid = event.data.uid;
        let column = table['columns'][uid];
        let index =  jointable['uid'].indexOf(uid)
        if(index != -1) jointable['uid'].splice(index,1);
        column.element['join'].remove();
        delete column.element['join'];
    }
    let ConditionJoinElement = function(tid,uid){
        return $($.parseHTML(`
        <span data-name=Column>
            <text data-type="text"></text>
            <span data-name="compareDropZone" tid=${tid} uid=${uid}>= <t> <input type="text" class="ConditionParameter"></t></span>
            <button data-name="delete">X</button>
            <br>
        </span>
        `));
    }
    function SetConditionJoinElementEvents(element,jointable,table,uid){
        element.find("[data-name='delete']").on('click',{jointable,table,uid},DeleteJoinTableConditionElement);
        element.find(".ConditionParameter").on('change',{jointable,uid},ChangeJoinTableConditionParameter);
    }
    function DeleteJoinTableConditionElement(event){
        let jointable = event.data.jointable;
        let table = event.data.table;
        let uid = event.data.uid;
        let tid = table.id;
        let column = table['columns'][uid];
        column.element['JoinCondition'].remove();
        delete column.element['JoinCondition'];
            //jointable的條件已被放入關聯的資料表資料 要清除關於此資料表的JoinCompareCondition
        if(typeof jointable.conditionUID[uid] != "undefined"){
            if(typeof jointable.conditionUID[uid] == "string"){
                delete jointable['conditionUID'][uid];
            }else{
                let [tabletid,tableuid] = jointable.conditionUID[uid];
                let table = TableList[tabletid];
                let column = table.columns[tableuid];
                delete table.element[`JoinCompareCondition${tid}-${uid}`];
                delete column.element[`JoinCompareCondition${tid}-${uid}`];
                delete jointable['conditionUID'][uid];
            }
        }
    }
    function ChangeJoinTableConditionParameter(event){
        let jointable = event.data.jointable;
        let uid = event.data.uid;
        jointable.conditionUID[uid] = $(this).val();
        $(SelectedElement.element).attr("data-name","");
        $(SelectedElement.element.closest("[data-name=Condition]")).trigger("click");
    }
    let ConditionCompareElement = function(){
        return $($.parseHTML(`
            <span><text data-type='text'></text></span>
        `));
    }

    $().ready(function(){
        RenderQueryTable();
    });
    function RenderQueryTable(){
        let database = [];
        database.push({
            Name:'mysql',
            isUsable:true,
        },{
            Name:'Codeigniter',
            isUsable:false,
        },{
            Name:'Laravel',
            isUsable:false,
        }
        )
        let element = '<ul class="nav nav-tabs" irole="tablist">';
        database.forEach(function(e){
            element += QueryNavElement(e.Name,e.isUsable);
        });
        element += '</ul>';
        element += '<div class="tab-content">';
        database.forEach(function(e){
            element += QueryContentElement(e.Name,e.isUsable);
        });
        element += '</div>';

        $("#QueryTable").html(element);
        SetQueryTableEvents(database);
    }
    let QueryNavElement = function(Name,isUsable){
        return `
        
            <li class="nav-item">
                <a class="nav-link ${isUsable ?"":"disabled"}" id="${Name}-tab" data-toggle="tab" href="#${Name}" role="tab" aria-controls="${Name}" aria-selected="true">${Name.toUpperCase()}</a>
            </li>
        `;
    }
    let QueryContentElement = function(Name,isUsable){
        return isUsable?`
            <div class="tab-pane fade show container" role="tabpanel" aria-labelledby="${Name}-tab" id="${Name}">
                <ul class="nav nav-tabs" irole="tablist">
                    <li class="nav-item">
                        <a class="nav-link" id="${Name}SELECT-tab" data-toggle="tab" href="#${Name}SELECT" role="tab" aria-controls="SELECT" aria-selected="true">SELECT</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="${Name}INSERT-tab" data-toggle="tab" href="#${Name}INSERT" role="tab" aria-controls="INSERT" aria-selected="true">INSERT</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="${Name}UPDATE-tab" data-toggle="tab" href="#${Name}UPDATE" role="tab" aria-controls="UPDATE" aria-selected="true">UPDATE</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="${Name}DELETE-tab" data-toggle="tab" href="#${Name}DELETE" role="tab" aria-controls="DELETE" aria-selected="true">DELETE</a>
                    </li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane fade show container" role="tabpanel" aria-labelledby="${Name}SELECT-tab" id="${Name}SELECT">SELECT!</div>
                    <div class="tab-pane fade show container" role="tabpanel" aria-labelledby="${Name}INSERT-tab" id="${Name}INSERT">INSERT!</div>
                    <div class="tab-pane fade show container" role="tabpanel" aria-labelledby="${Name}UPDATE-tab" id="${Name}UPDATE">UPDATE!</div>
                    <div class="tab-pane fade show container" role="tabpanel" aria-labelledby="${Name}DELETE-tab" id="${Name}DELETE">DELETE!</div>
                </div>
            </div>
            `:"";
    }
    function SetQueryTableEvents(database){
        database.forEach(function(e){
            let DataBaseName = e.Name;
            $(`#${DataBaseName} #${DataBaseName}SELECT-tab`).click({DataBaseName},QueryForSELECT);
            $(`#${DataBaseName} #${DataBaseName}INSERT-tab`).click({DataBaseName},QueryForINSERT);
            $(`#${DataBaseName} #${DataBaseName}UPDATE-tab`).click({DataBaseName},QueryForUPDATE);
            $(`#${DataBaseName} #${DataBaseName}DELETE-tab`).click({DataBaseName},QueryForDELETE);
        });
    }
    function QueryForSELECT(event){
        let database = event.data.DataBaseName;
        let Query = global.Query[database];
        $(`#${database} #${database}SELECT`).html(Query.SELECT());
    }
    function QueryForUPDATE(event){
        let database = event.data.DataBaseName;
        let Query = global.Query[database];
        $(`#${database} #${database}UPDATE`).html(Query.UPDATE());
    }
    function QueryForINSERT(event){
        let database = event.data.DataBaseName;
        let Query = global.Query[database];
        $(`#${database} #${database}INSERT`).html(Query.INSERT());
    }
    function QueryForDELETE(event){
        let database = event.data.DataBaseName;
        let Query = global.Query[database];
        $(`#${database} #${database}DELETE`).html(Query.DELETE());
    }
    global.Query = [MainTable,TableList,JoinTableList];
    console.log(global.Query);
    $().ready(function(){
        $("#upload").change(uploadSQLTable);
    });
    function uploadSQLTable(){
        let file = $("#upload")[0].files[0];
        let reader = new FileReader;
        reader.readAsText(file,'UTF-8');
        reader.onload = function(e){
            CreateSQLTableFromQuery(e.target.result);
        }
    }
    function CreateSQLTableFromQuery(query){
        let result = pushToken(query,/CREATE TABLE(?= `)(.+\n)+/);
        let tablesInfo = [];
        result.forEach(function(e){
            let token = pushToken(e,/`.+?`/);
            //去除`
            token.forEach(function(e,index){
                let regex = "\`";
                while(token[index].match(regex) != null){
                    token[index] = token[index].replace(regex,"");
                }
            });
            tablesInfo.push(token);
        });
        tablesInfo.forEach(function(table){
            let inputTable = $("#InputTableDiv");
            inputTable.find("[data-name=TableName]").val(table[0]); //第一個是Table名
            inputTable.find("[data-name=TableName]").change(); //讓val寫入nameInterval
            table.shift(); //移除後進迴圈
            table.forEach(function(col,index){
                inputTable.find("[data-name=addColumn]").trigger("click");
                inputTable.find(`[data-name=ColumnName][uid=${index}]`).val(col);
                inputTable.find(`[data-name=ColumnName][uid=${index}]`).change();
            });
            inputTable.find("[data-name=finish]").trigger("click");
        });
    }
    function pushToken(e,regex){
        let token = [];
        while(e.match(regex) != null){
            token.push(e.match(regex)[0]);
            e = e.replace(regex,"");
        }
        return token;
    }
    console.log(JoinTableList);
})(this);