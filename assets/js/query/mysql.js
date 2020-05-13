;
(function(global,Query){
    let [MainTable,TableList,JoinTableList] = [Query[0],Query[1],Query[2]];
    console.log(MainTable,TableList,JoinTableList);
    Query['mysql'] = {
        SELECT : ()=>{
            let Query = ['SELECT'];
            let Selected = [];
            let tid = MainTable.tid;
            if(tid == -1) return "Error 沒有選擇主資料表";
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
                        if(condition == null) Selected.push(`${table.name}.${table.columns[j].name} = ?`);
                        else{
                            let [tableX,ColumnX] = jointable['conditionUID'][j].split('-');
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
            if(conditionUID.length>0){
                Query.push(` WHERE`);
                for(j in conditionUID){
                    let index = conditionUID[j];
                    let column = table.columns[index];
                    if(j == conditionUID.length-1)
                        Query.push(`${table.name}.${column.name} = ?`);
                    else
                        Query.push(`${table.name}.${column.name} = ? AND`);
                }
            }
            return Query.join(" ");
        },
        INSERT : ()=>{
            let Query = ['INSERT INTO'];
            let Selected = [];
            let tid = MainTable.tid;
            if(tid == -1) return "Error 沒有選擇主資料表";
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
            return Query.join(" ");
        },
        DELETE : ()=>{
            let Query = ['DELETE'];
            let Selected = [];
            let tid = MainTable.tid;
            if(tid == -1) return "Error 沒有選擇主資料表";
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
                        if(condition == null) Selected.push(`${table.name}.${table.columns[j].name} = ?`);
                        else{
                            let [tableX,ColumnX] = jointable['conditionUID'][j].split('-');
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
            if(conditionUID.length>0){
                Query.push(` WHERE`);
                for(j in conditionUID){
                    let index = conditionUID[j];
                    let column = table.columns[index];
                    if(j == conditionUID.length-1)
                        Query.push(`${table.name}.${column.name} = ?`);
                    else
                        Query.push(`${table.name}.${column.name} = ? AND`);
                }
            }
            return Query.join(" ");
        },
        UPDATE : ()=>{
            let Query = ['UPDATE'];
            let Selected = [];
            let tid = MainTable.tid;
            if(tid == -1) return "Error 沒有選擇主資料表";
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
                        if(condition == null) Selected.push(`${table.name}.${table.columns[j].name} = ?`);
                        else{
                            let [tableX,ColumnX] = jointable['conditionUID'][j].split('-');
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
            if(flag[0]&&flag[1]) return "Error UPDATE至少要選擇一項要更新的欄位";
            Query.push("SET");
            for(i in Selected){
                if(i == Selected.length-1)
                    Query.push(Selected[i]+" = ?");
                else
                    Query.push(Selected[i]+" = ?,");

            }
            if(conditionUID.length>0){
                Query.push(` WHERE`);
                for(j in conditionUID){
                    let index = conditionUID[j];
                    let column = table.columns[index];
                    if(j == conditionUID.length-1)
                        Query.push(`${table.name}.${column.name} = ?`);
                    else
                        Query.push(`${table.name}.${column.name} = ? AND`);
                }
            }else{
                alert("WHERE 條件式記得要加哦！這樣才會只更新特定某(幾)筆資料，不然全部的資料都會更改。");
            }
            return Query.join(" ");
        }
    };
})(this,Query);
