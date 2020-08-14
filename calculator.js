function $(id) {
    return document.getElementById(id);
}
function C(cls) {
    return document.getElementsByClassName(cls);
}
//写自己的计算逻辑

// 计算按钮逻辑
function Calculation(key) {

    // 获取计算点击之前的计算数组的值
    let calculation = this.state.calculation; // 点击之前的计算数组
    let num = parseFloat(this.state.num);   // 点击之前的数据区域的操作数
    let result = this.state.result; // 上一次的计算结果
    let calculationResults = 0; // 记录当前计算结果

    // 将点击之前的数据区域的操作数追加到计算数组，进行计算
    if (this.state.status === 2){ // 上一次操作是数字按钮
        calculation.push(num); // 把操作数追加到计算数组
    }
    // 如果最近一次操作是操作数，则计算
    // 否则替换上一个操作符
    if( calculation && typeof(calculation[calculation.length-1]) === 'number'){
        // 计算数组可以进行计算
        if(calculation.length > 2){ // 至少3个元素才能构成算数表达式，例如 1+1
            // 获取上一次点击的操作符
            let calculationSymbol = calculation[calculation.length-2];
            // 计算
            switch (calculationSymbol) {

                case '÷':
                    // 将上一次的计算结果与当前操作数相除
                    calculationResults = result / num;
                    break;

                case '×':
                    // 将上一次的计算结果与当前操作数相乘
                    calculationResults = result * num;
                    break;

                case '-':
                    // 将上一次的计算结果与当前操作数相减
                    calculationResults = result - num;
                    break;

                case '+':
                    // 将上一次的计算结果与当前操作数相加
                    calculationResults = result + num;
                    break;

                default:
                    break;
            }
            // 浮点数运算误差，数据展示类（使用 toPrecision 凑整并 parseFloat 转成数字后再显示）
            calculationResults = parseFloat(calculationResults.toPrecision(12))
            // 重新render，更新页面
            this.setState({
                status: 0, // 计算按钮
                calculation: calculation,  // 计算数组
                result: calculationResults, // 计算结果
                num: 0, // 数据重置
            })
        } else { // 计算数组元素少于3，不能构成算数表达式，不计算
            this.setState({
                status: 0, // 计算按钮
                calculation: calculation,  // 计算数组
                result: num, // 计算结果为操作数
                num: 0, // 将操作数重置为0，准备下一次操作
            })
        }
        // 将当前点击的操作符追加到计算数组
        calculation.push(key);
    } else { // 否则替换上一个操作符
        // 如果上一个操作符是 = ，则计算数组的值更新为计算结果
        if(calculation[calculation.length-1] === '='){
            calculation = [ result, '=' ]
        }
        // 替换上一个操作符
        calculation[calculation.length-1] = key
        // 重新render，更新计算数组
        this.setState({
            calculation: calculation
        })
    }
}

// 数字按钮逻辑
function num(key) {
    // 获取点击的操作数
    let num = this.state.num;
    let calculation = this.state.calculation; // 点击之前的计算数组

    if(this.state.status === 1){ // 如果上一次操作是%
        // 如果点击± ，当前数字为相反数
        if(key === '±'){
            num = (-(parseFloat(num))).toString()
        } else if (key === '.' && (num.indexOf('.') > -1)){ // 如果当前是小数则不能再点击'.'
            return
        } else { // 否则操作数为当前点击的数字
            num = 0 + key;
            calculation.length = calculation.length - 1 // 将上一次%计算的值删除
        }
    } else if(calculation[calculation.length-1] === '='){ // 如果上一次操作是=，则开始一次新的计算
        calculation = []; // 计算数组清空
        num = key; // 操作数为当前点击的数字
    } else {
        if(key === '±'){ // 如果当前是±，当前数字为相反数
            num = (-(parseFloat(num))).toString()
        } else if (key === '.' && (num.indexOf('.') > -1)){ // 如果当前是小数则不能再点击'.'
            return
        } else { // 多位数
            num = num + key;
        }
    }
    // 如果不是小于1的小数，第一个字符是0，则去除
    num = ((num.indexOf('0') === 0 && num.indexOf('.') !== 1) ? num.substring(1) : num)
    // setState重新render
    // 将数字区域的值更新为当前点击的操作数
    this.setState({
        status: 2, // 数字按钮
        calculation: calculation, // 计算数组
        num: num, // 数字
    })
}

// 功能按钮逻辑
function clickBtn(key) {
    // 获取点击之前的数据
    let calculation = this.state.calculation; // 点击之前的计算数组
    let num = parseFloat(this.state.num);   // 点击之前的数据区域的操作数
    let result = this.state.result; // 点击之前的数据区域的计算值
    let history = this.state.history; // 历史记录

    switch (key) {

        case '%':
            // 对操作数进行计算
            if( this.state.status === 0 ){ // 如果上一次操作是计算按钮
                if(calculation[calculation.length-1] === '+' || calculation[calculation.length-1] === '-'){
                    // + - 上一次计算结果的平方*0.01
                    num = (result * result) * 0.01;
                } else if (calculation[calculation.length-1] === '×' || calculation[calculation.length-1] === '÷'){
                    // × ÷ 上一次计算结果*0.01
                    num = result * 0.01;
                }
            } else { // 如果上一次操作是功能按钮或者数字按钮
                // 将上一次的计算结果与最近的操作数相乘并取其百分值
                num = (result * num) * 0.01;
            }
            // 将点击之前的数据区域的操作数追加到计算数组，进行计算
            calculation.push(num);
            // 如果计算数组的最后一个元素是数字
            if( calculation && typeof(calculation[calculation.length-1]) === 'number'){
                // 则重新render，更新页面
                this.setState({
                    status: 1, // 功能按钮
                    calculation: calculation,  // 计算数组
                    result: result, // 计算结果
                    num: num, // 数据重置
                })
            }
            break;

        case 'CE':
            // 如果上一次操作是计算
            if(this.state.status === 0){
                // 重置，准备下一次操作
                this.setState({
                    status: 2, // 功能按钮
                    calculation: [],  // 计算数组
                    num: 0, // 数据重置
                })
            } else {
                // 否则将操作数重置为0
                this.setState({
                    status: 2, // 数字按钮
                    num: 0
                })
            }
            break;

        case 'C':
            // 重置，准备下一次操作
            // 将计算数组清空，操作数重置为0
            this.setState({
                status: 2, // 功能按钮
                calculation: [],  // 计算数组
                num: 0, // 数据重置
            })
            break;
            
        case '=':
            // 计算
            Calculation.call(this, key);
            // 计算完成后缓存历史记录
            // 将历史记录缓存到sessionStorage
            setTimeout(()=>{
                const calculation = this.state.calculation;
                const result = this.state.result;
                // 入队
                // 将计算数组和结果插入头部
                history.unshift({
                    calculation: calculation,
                    result: result
                });
                // 出队
                // 历史记录超过9条从尾部删除
                if(history.length > 6){
                    history.length = 6;
                }
                // render历史记录
                this.setState({
                    history: history,
                })
            },0)
            break;

        default:
            break;
    }
}