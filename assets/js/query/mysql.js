;
(function(global,Query){
    let [MainTable,TableList,JoinTableList] = [Query[0],Query[1],Query[2]];
    let msg = {
        text:"",
        status:-1,
    };
    Query['mysql'] = {
        SELECT : ()=>{
            let Query = ['SELECT'];
            let Selected = [];
            let tid = MainTable.tid;
            if(tid == -1){
                msg.status = -1;
                msg.text="請選擇主要的資料表";
                return msg;
            }
            let uid = MainTable.uid;
            let conditionUID = MainTable.conditionUID;
            let table = TableList[tid];
            let LengthBeforeSelectedChanged = 0;
            for(i in uid){
                let index = uid[i];
                let column = table.columns[index];
                Selected.push(`${table.name}.${column.name}`);
            }
            if(LengthBeforeSelectedChanged==Selected.length) Selected.push(`${table.name}.*`);
            LengthBeforeSelectedChanged=Selected.length;
            for(i in JoinTableList){
                if(JoinTableList[i]['tid'] < 0) continue;
                let table = TableList[JoinTableList[i]['tid']];
                for(j in JoinTableList[i]['uid']){
                    let index = JoinTableList[i]['uid'][j];
                    let col = table.columns[index];
                    Selected.push(`${table.name}.${col.name}`);
                }
                if(LengthBeforeSelectedChanged==Selected.length) Selected.push(`${table.name}.*`);
                LengthBeforeSelectedChanged=Selected.length;
            }
            for(i in Selected){
                if(i == Selected.length-1)
                    Query.push(Selected[i]);
                else
                    Query.push(Selected[i]+",");
            }
            Query.push(` FROM ${table.name}`);
            for(i in JoinTableList){
                let jointable = JoinTableList[i];
                if(jointable.tid<0) continue;
                Query.push(jointable.JoinMode);
                let table = TableList[jointable.tid];
                Query.push(table.name);
                Query.push("ON");
                Selected = [];
                if(Object.keys(jointable['conditionUID']).length > 0){
                    for(j in jointable['conditionUID']){
                        let condition = jointable['conditionUID'][j];
                        if(typeof condition == "string") Selected.push(`${table.name}.${table.columns[j].name} = '${condition}'`);
                        else{
                            let [tableX,ColumnX] = condition;
                            Selected.push(`${table.name}.${table.columns[j].name} = ${TableList[tableX].name}.${TableList[tableX].columns[ColumnX].name}`);
                        }
                    }
                    for(i in Selected){
                        if(i == Selected.length-1)
                            Query.push(Selected[i]);
                        else
                            Query.push(Selected[i]+" AND");
                    }
                }else{
                    Query.push("1=1");
                }
            }
            Query.push(`WHERE`);
            Selected = [];
            if(Object.keys(conditionUID).length>0){
                for(j in conditionUID){
                    let Parameter = conditionUID[j];
                    let column = table.columns[j];
                    Selected.push(`${table.name}.${column.name} = '${Parameter}'`);
                }
                for(i in Selected){
                    if(i == Selected.length-1)
                        Query.push(Selected[i]);
                    else
                        Query.push(Selected[i]+" AND");
                }
            }else{
                Query.push("1")
            }
            msg.status = 1;
            msg.text = Query.join(" ");
            return msg;
        },
        INSERT : ()=>{
            let Query = ['INSERT INTO'];
            let Selected = [];
            let tid = MainTable.tid;
            if(tid == -1){
                msg.status = -1;
                msg.text="請選擇主要的資料表";
                return msg;
            }
            let uid = MainTable.uid;
            let table = TableList[tid];
            
            Query.push(table.name);
            for(i in uid){
                let index = uid[i];
                let column = table.columns[index];
                Selected.push(`${column.name}`);
            }
            if(Selected.length>0){
                Query.push("(");
                for(i in Selected){
                    if(i == Selected.length-1)
                        Query.push(Selected[i]);
                    else
                        Query.push(Selected[i]+",");
                }
                Query.push(")");
                
                Query.push("VALUES");
                Query.push("(");
                for(i in Selected){
                    if(i == Selected.length-1)
                        Query.push("?");
                    else
                        Query.push("?"+",");
                }
                Query.push(")");
            }else{
                Query.push("VALUES");
                Query.push("(");
                for(let i = 0; i <Object.keys(table.columns).length;i++){
                    if(i == Object.keys(table.columns).length-1)
                        Query.push("?");
                    else
                        Query.push("?"+",");
                }
                Query.push(")");
            }
            msg.status = 1;
            msg.text = Query.join(" ");
            return msg;
        },
        DELETE : ()=>{
            let Query = ['DELETE'];
            let Selected = [];
            let tid = MainTable.tid;
            if(tid == -1){
                msg.status = -1;
                msg.text="請選擇主要的資料表";
                return msg;
            }
            let conditionUID = MainTable.conditionUID;
            let table = TableList[tid];
            Query.push(` FROM ${table.name}`);
            for(i in JoinTableList){
                let jointable = JoinTableList[i];
                if(jointable.tid<0) continue;
                Query.push(jointable.JoinMode);
                let table = TableList[jointable.tid];
                Query.push(table.name);
                Query.push("ON");
                Selected = [];
                if(Object.keys(jointable['conditionUID']).length > 0){
                    for(j in jointable['conditionUID']){
                        let condition = jointable['conditionUID'][j];
                        if(typeof condition == "string") Selected.push(`${table.name}.${table.columns[j].name} = '${condition}'`);
                        else{
                            let [tableX,ColumnX] = condition;
                            Selected.push(`${table.name}.${table.columns[j].name} = ${TableList[tableX].name}.${TableList[tableX].columns[ColumnX].name}`);
                        }
                    }
                    for(i in Selected){
                        if(i == Selected.length-1)
                            Query.push(Selected[i]);
                        else
                            Query.push(Selected[i]+" AND");
                    }
                }else{
                    Query.push("1=1");
                    alert("ON的條件式記得要加哦！這樣才會只更新特定某(幾)筆資料，不然全部的資料都會更改。");
                }
            }
            Query.push(`WHERE`);
            Selected = [];
            if(Object.keys(conditionUID).length>0){
                for(j in conditionUID){
                    let Parameter = conditionUID[j];
                    let column = table.columns[j];
                    Selected.push(`${table.name}.${column.name} = '${Parameter}'`);
                }
                for(i in Selected){
                    if(i == Selected.length-1)
                        Query.push(Selected[i]);
                    else
                        Query.push(Selected[i]+" AND");
                }
            }else{
                Query.push("1")
                alert("WHERE的條件式記得要加哦！這樣才會只更新特定某(幾)筆資料，不然全部的資料都會更改。");
            }
            msg.status = 1;
            msg.text = Query.join(" ");
            return msg;
        },
        UPDATE : ()=>{
            let Query = ['UPDATE'];
            let Selected = [];
            let tid = MainTable.tid;
            if(tid == -1){
                msg.status = -1;
                msg.text="請選擇主要的資料表";
                return msg;
            }
            let uid = MainTable.uid;
            let conditionUID = MainTable.conditionUID;
            let table = TableList[tid];
            let LengthBeforeSelectedChanged = 0;
            let flag = [true,true];

            Query.push(table.name);
            for(i in JoinTableList){
                let jointable = JoinTableList[i];
                if(jointable.tid<0) continue;
                Query.push(jointable.JoinMode);
                let table = TableList[jointable.tid];
                Query.push(table.name);
                Query.push("ON");
                Selected = [];
                if(Object.keys(jointable['conditionUID']).length > 0){
                    for(j in jointable['conditionUID']){
                        let condition = jointable['conditionUID'][j];
                        if(typeof condition == "string") Selected.push(`${table.name}.${table.columns[j].name} = '${condition}'`);
                        else{
                            let [tableX,ColumnX] = condition;
                            Selected.push(`${table.name}.${table.columns[j].name} = ${TableList[tableX].name}.${TableList[tableX].columns[ColumnX].name}`);
                        }
                    }
                    for(i in Selected){
                        if(i == Selected.length-1)
                            Query.push(Selected[i]);
                        else
                            Query.push(Selected[i]+" AND");
                    }
                }else{
                    Query.push("1=1");
                    alert("ON的條件式記得要加哦！這樣才會只更新特定某(幾)筆資料，不然全部的資料都會更改。");
                }
            }
            Selected = [];
            for(i in uid){
                let index = uid[i];
                let column = table.columns[index];
                Selected.push(`${table.name}.${column.name}`);
            }
            if(LengthBeforeSelectedChanged!=Selected.length) flag[0] = false;
            LengthBeforeSelectedChanged=Selected.length;
            for(i in JoinTableList){
                if(JoinTableList[i]['tid'] < 0) continue;
                let table = TableList[JoinTableList[i]['tid']];
                for(j in JoinTableList[i]['uid']){
                    let index = JoinTableList[i]['uid'][j];
                    let col = table.columns[index];
                    Selected.push(`${table.name}.${col.name}`);
                }
                if(LengthBeforeSelectedChanged!=Selected.length) flag[1] = false;
                LengthBeforeSelectedChanged=Selected.length;
            }
            if(flag[0]&&flag[1]) {
                msg.status = -1;
                msg.text=" UPDATE至少要選擇一項要更新的欄位";
                return msg;
            }
            Query.push("SET");
            for(i in Selected){
                if(i == Selected.length-1)
                    Query.push(Selected[i]+" = ?");
                else
                    Query.push(Selected[i]+" = ?,");

            }
            Query.push(`WHERE`);
            Selected = [];
            if(Object.keys(conditionUID).length>0){
                for(j in conditionUID){
                    let Parameter = conditionUID[j];
                    let column = table.columns[j];
                    Selected.push(`${table.name}.${column.name} = '${Parameter}'`);
                }
                for(i in Selected){
                    if(i == Selected.length-1)
                        Query.push(Selected[i]);
                    else
                        Query.push(Selected[i]+" AND");
                }
            }else{
                Query.push("1")
                alert("WHERE 條件式記得要加哦！這樣才會只更新特定某(幾)筆資料，不然全部的資料都會更改。");
            }
            msg.status = 1;
            msg.text = Query.join(" ");
            return msg;
        }
    };
})(this,Query);
