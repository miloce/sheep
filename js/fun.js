// -> 封装 随机位置 随机卡片 的函数
function random({ len, difficulty }) {

    let boxLen = len - 12 * 2;// 定义 box 内总卡片数

    let leftLen = rightLen = 12;// 定义 left 和 right 内总卡片数

    let multiple = len / 3;// 倍数

    // 避免长度太长 设置最长值为卡片数组的长度
    difficulty = difficulty >= card.length - 1 ? card.length - 1 : difficulty;

    // 避免出现难度太高
    difficulty = difficulty * 3 >= boxLen ? boxLen / 3 : difficulty;

    // 随机删除一个 直至数组长度为传入的困难度 最后的到展示的可能出现的卡牌
    do {
        card.splice(Math.floor(Math.random() * (card.length + 1)), 1)
    } while (card.length != difficulty);

    // 随机 将5种卡片 变成 总长度个
    let tempCard = [];
    do {
        let index = Math.floor(Math.random() * card.length);
        let one = Math.floor(Math.random() * (tempCard.length + 1));
        let two = Math.floor(Math.random() * (tempCard.length + 1));
        let three = Math.floor(Math.random() * (tempCard.length + 1));
        tempCard.splice(one, 0, card[index]);
        tempCard.splice(two, 0, card[index]);
        tempCard.splice(three, 0, card[index]);
    } while (tempCard.length != multiple * 3);

    let poor = boxLen;// 每行随机数后 全部位置的差 默认差值是最长
    let odd = [];// 奇数的数组
    let even = [];// 偶数的数组
    let tempArr = [];// 奇数偶数数组 7个一组 6个一组 排列
    let tempPosition = [];

    // 进行每一行位置个数随机 随机数为奇数则放置奇数数组 同理偶数数组
    do {
        let num = Math.ceil(Math.random() * 7);
        (num % 2 == 0 ? even : odd).push(num);
        poor -= num;
    } while (poor > 7);
    (poor % 2 == 0 ? even : odd).push(poor);

    // 将奇数偶数组数 交叉的 放置在tempArr数组中
    let flag = 7;
    do {
        tempArr.push((flag == 7 ? odd : even).splice(0, flag - 1));
        flag = flag == 7 ? 6 : 7;
    } while (odd.length || even.length);

    let reset = false;
    reset = tempArr.some(item => !item.length);
    if (reset) {
        console.log("重置");
        return random({ len, difficulty });
    }

    // 将空白位置填充完整
    flag = 7;
    tempArr.forEach((item, row) => {

        while (item.length < flag - 1) {
            item.push(0)
        };
        flag = flag == 7 ? 6 : 7;

    })

    // 将tempArr数组转换成另一种数组形势 数组内全为true或false
    flag = 7;
    tempArr.forEach((item, row) => {

        tempPosition[row] = [];
        item.forEach((val_true, col) => {

            tempPosition[row][col] = [];
            for (let i = 0; i < val_true; i++)
                tempPosition[row][col].push(true);

            if (val_true == 0 && flag == 7)
                tempPosition[row][col].push(false);

            let val_false = flag - val_true;
            for (let i = 0; i < Math.floor(val_false / 2); i++) {
                tempPosition[row][col].push(false);
                tempPosition[row][col].unshift(false);
            }

        })

        flag = flag == 7 ? 6 : 7;


    })

    // console.log(tempArr);
    // console.log(tempPosition);

    // 两个数组合并进对象
    tempPosition.forEach((box, zIndex) => {

        list.box[zIndex] = [];// 初始化数组

        box.forEach((bigSmall, row) => {

            list.box[zIndex][row] = [];// 数组化行

            bigSmall.forEach((val, col) => {

                list.box[zIndex][row][col] = {
                    zIndex,
                    row,
                    col,
                    fade: false,
                    isChecked: false,
                    id: val ? tempCard.splice(Math.floor(Math.random() * tempCard.length), 1)[0] : ""
                }

            })

        })

    })

    // 左侧卡片left数组
    tempCard.splice(0, leftLen).forEach((id, index) => {
        list.left[index] = { id, index, fade: true }
    })

    // 右侧卡片right数组
    tempCard.splice(0, rightLen).forEach((id, index) => {
        list.right[index] = { id, index, fade: true }
    })

    // 调用处理层叠问题方法
    changeFade();

    // 调用数据拦截函数 开启拦截数据
    proxyList()

}

// -> 处理层叠问题 由上至下
function changeFade() {

    // 封装递归方法
    function change({ id, zIndex, row, col, isChecked }) {

        // 有卡片才执行 并且没有执行过的
        if (id && !isChecked) {

            // 先把状态反转
            // console.log(zIndex);
            // console.log(row);
            // console.log(col);
            // console.log(list.box);
            list.box[zIndex][row][col].isChecked = true;

            // 得到当前层的标识
            let len = zIndex % 2 == 0 ? 7 : 6;

            // 将下标改成下层 如果下标小于零则退出
            if (--zIndex < 0) return;

            if (len == 7) {// 当前层是big

                if (list.box[zIndex][row] && list.box[zIndex][row][col]) {
                    list.box[zIndex][row][col].fade = true;
                    // let id = list.box[zIndex][row][col].id;
                    // let isChecked = list.box[zIndex][row][col].isChecked;
                    // change({ id, zIndex, row, col, isChecked })
                    for (let i = zIndex; i >= 0; i--) ((i % 2 == zIndex % 2) ? change({ id: list.box[i][row][col].id, zIndex: i, row, col, isChecked: list.box[i][row][col].isChecked }) : true);
                }

                if (list.box[zIndex][row - 1] && list.box[zIndex][row - 1][col]) {
                    list.box[zIndex][row - 1][col].fade = true;
                    // let id = list.box[zIndex][row - 1][col].id;
                    // let isChecked = list.box[zIndex][row - 1][col].isChecked;
                    // change({ id, zIndex, row: row - 1, col, isChecked })
                    for (let i = zIndex; i >= 0; i--) ((i % 2 == zIndex % 2) ? change({ id: list.box[i][row - 1][col].id, zIndex: i, row: row - 1, col, isChecked: list.box[i][row - 1][col].isChecked }) : true);
                }

                if (list.box[zIndex][row] && list.box[zIndex][row][col - 1]) {
                    list.box[zIndex][row][col - 1].fade = true;
                    // let id = list.box[zIndex][row][col - 1].id;
                    // let isChecked = list.box[zIndex][row][col - 1].isChecked;
                    // change({ id, zIndex, row, col: col - 1, isChecked })
                    for (let i = zIndex; i >= 0; i--) ((i % 2 == zIndex % 2) ? change({ id: list.box[i][row][col - 1].id, zIndex: i, row, col: col - 1, isChecked: list.box[i][row][col - 1].isChecked }) : true);
                }

                if (list.box[zIndex][row - 1] && list.box[zIndex][row - 1][col - 1]) {
                    list.box[zIndex][row - 1][col - 1].fade = true;
                    // let id = list.box[zIndex][row - 1][col - 1].id;
                    // let isChecked = list.box[zIndex][row - 1][col - 1].isChecked;
                    // change({ id, zIndex, row: row - 1, col: col - 1, isChecked })
                    for (let i = zIndex; i >= 0; i--) ((i % 2 == zIndex % 2) ? change({ id: list.box[i][row - 1][col - 1].id, zIndex: i, row: row - 1, col: col - 1, isChecked: list.box[i][row - 1][col - 1].isChecked }) : true);
                }

            } else if (len == 6) {// 当前层是small

                if (list.box[zIndex][row] && list.box[zIndex][row][col]) {
                    list.box[zIndex][row][col].fade = true;
                    // let id = list.box[zIndex][row][col].id;
                    // let isChecked = list.box[zIndex][row][col].isChecked;
                    // change({ id, zIndex, row, col, isChecked })
                    for (let i = zIndex; i >= 0; i--) ((i % 2 == zIndex % 2) ? change({ id: list.box[i][row][col].id, zIndex: i, row, col, isChecked: list.box[i][row][col].isChecked }) : true);
                }

                if (list.box[zIndex][row + 1] && list.box[zIndex][row + 1][col]) {
                    list.box[zIndex][row + 1][col].fade = true;
                    // let id = list.box[zIndex][row + 1][col].id;
                    // let isChecked = list.box[zIndex][row + 1][col].isChecked;
                    // change({ id, zIndex, row: row + 1, col, isChecked });
                    for (let i = zIndex; i >= 0; i--) ((i % 2 == zIndex % 2) ? change({ id: list.box[i][row + 1][col].id, zIndex: i, row: row + 1, col, isChecked: list.box[i][row + 1][col].isChecked }) : true);
                }

                if (list.box[zIndex][row] && list.box[zIndex][row][col + 1]) {
                    list.box[zIndex][row][col + 1].fade = true;
                    // let id = list.box[zIndex][row][col + 1].id;
                    // let isChecked = list.box[zIndex][row][col + 1].isChecked;
                    // change({ id, zIndex, row, col: col + 1, isChecked });
                    for (let i = zIndex; i >= 0; i--) ((i % 2 == zIndex % 2) ? change({ id: list.box[i][row][col + 1].id, zIndex: i, row, col: col + 1, isChecked: list.box[i][row][col + 1].isChecked }) : true);
                }

                if (list.box[zIndex][row + 1] && list.box[zIndex][row + 1][col + 1]) {
                    list.box[zIndex][row + 1][col + 1].fade = true;
                    // let id = list.box[zIndex][row + 1][col + 1].id;
                    // let isChecked = list.box[zIndex][row + 1][col + 1].isChecked;
                    // change({ id, zIndex, row: row + 1, col: col + 1, isChecked });
                    for (let i = zIndex; i >= 0; i--) ((i % 2 == zIndex % 2) ? change({ id: list.box[i][row + 1][col + 1].id, zIndex: i, row: row + 1, col: col + 1, isChecked: list.box[i][row + 1][col + 1].isChecked }) : true);
                }

            }

        }

    }

    // 将全部的状态翻转
    list.box.forEach(box => {
        box.forEach(bigSmalls => {
            bigSmalls.forEach(itemBoxs => {
                itemBoxs.fade = false;
                itemBoxs.isChecked = false;
            })
        })
    })

    // 遍历所有层
    for (let i = list.box.length - 1; i >= 0; i--) {

        // 当前层遍历
        list.box[i].forEach(itemBoxs => {
            itemBoxs.forEach(item => {

                // 结构item
                let { fade, id, zIndex, row, col, isChecked } = item;

                // 调用方法
                change({ fade, id, zIndex, row, col, isChecked });


            })
        })

        // 当前层遍历
        list.box[i].forEach(itemBoxs => {
            itemBoxs.forEach(item => {

                let { zIndex, row, col, id } = item;

                if (id) {

                    for (let z = zIndex; z >= 2; z--) {

                        // let len = z % 2 == 0 ? 7 : 6;

                        // if (z - 2 < 0) break;

                        if (zIndex % 2 == 0) {//外层是big

                            if (z % 2 == 0) {// 内层是big

                                list.box[z - 2][row][col].fade = true;

                            } else {// 内层是small

                                if (list.box[z - 2][row] && list.box[z - 2][row][col]) {
                                    list.box[z - 2][row][col].fade = true;
                                }

                                if (list.box[z - 2][row - 1] && list.box[z - 2][row - 1][col]) {
                                    list.box[z - 2][row - 1][col].fade = true;
                                }

                                if (list.box[z - 2][row] && list.box[z - 2][row][col - 1]) {
                                    list.box[z - 2][row][col - 1].fade = true;
                                }

                                if (list.box[z - 2][row - 1] && list.box[z - 2][row - 1][col - 1]) {
                                    list.box[z - 2][row - 1][col - 1].fade = true;
                                }

                            }

                        } else {// 外层是small

                            if (z % 2 == 0) {// 内层是big

                                list.box[z - 2][row][col].fade = true;

                                if (list.box[z - 2][row + 1] && list.box[z - 2][row + 1][col]) {
                                    list.box[z - 2][row + 1][col].fade = true;
                                }

                                if (list.box[z - 2][row] && list.box[z - 2][row][col + 1]) {
                                    list.box[z - 2][row][col + 1].fade = true;
                                }

                                if (list.box[z - 2][row + 1] && list.box[z - 2][row + 1][col + 1]) {
                                    list.box[z - 2][row + 1][col + 1].fade = true;
                                }

                            } else {// 内层是small

                                list.box[z - 2][row][col].fade = true;

                            }

                        }



                    }

                }

            })
        })

    }

}

// -> 封装渲染页面的函数
function readerAll() {

    let boxHtml = ``;
    let flag = 7;

    // 调用渲染按钮的函数
    readerBtn();

    // 字符串模板累加
    list.box.forEach((box, zIndex) => {

        let itemBoxs = ``;

        box.forEach((bigSmall, row) => {

            bigSmall.forEach(({ fade, id }, col) => {

                if (id) {

                    itemBoxs += `
                        <div class="itemBox">
                            <div class="item ${fade ? "fade" : ""}"  data-zindex="${zIndex}" data-row="${row}" data-col="${col}">
                                <svg class="icon" aria-hidden="true">
                                    <use xlink:href="${id}"></use>
                                </svg>
                            </div>
                        </div>
                    `;

                } else {

                    itemBoxs += `
                        <div class="itemBox">
                            
                        </div>
                    `;

                }

            })


        })

        boxHtml += `
            <!-- - 第 ${zIndex} 层 -->
            <div class="${flag == 7 ? "big" : "small"}">
                ${itemBoxs}
            </div>
        `;
        flag = flag == 7 ? 6 : 7;

    })

    // 直接替换html
    $(".box").html(boxHtml);

    // 渲染left
    $(".left .itemBox").empty();
    list.left.forEach(({ index, id }) => {
        $(".left .itemBox").eq(index).html(`
            <div class="item ${index == list.left.length - 1 ? "" : "fade"}" data-index="${index}">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="${id}"></use>
                </svg>
            </div>
        `)
    })

    // 渲染right
    $(".right .itemBox").empty();
    list.right.forEach(({ index, id }) => {
        $(".right .itemBox").eq(index).html(`
            <div class="item ${index == list.right.length - 1 ? "" : "fade"}" data-index="${index}">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="${id}"></use>
                </svg>
            </div>
        `)
    })

    // 页面加载完才加载动画
    $(document).ready(function () {

        // 叠层动画效果
        $(".box>div").each(function (i, el) {
            $(el).find(".itemBox").css("transition-delay", `${i * 0.75}s`)
            $(el).find(".itemBox").css("transform", "translateY(0px)")
            $(el).find(".itemBox").css("opacity", "1")
        })

        // 左右两边的布局 层叠感 css不容易实现 写在js
        $(".left .itemBox").each((i, el) => {
            $(el).css("left", i * 5 + "px");
        })
        $(".right .itemBox").each((i, el) => {
            $(el).css("right", i * 5 + "px");
        });

    })

    // 等动画加载完了才可点击页面 动画结束清楚延迟
    $(".box>div .itemBox:last").on("webkitTransitionEnd", function () {
        $(".box .itemBox").css("transition-delay", "0s");
        $(".box .itemBox").css("transform", "none");
        setTimeout(() => { $("aside img").css("z-index", 10); }, 1000);
        clickAble = true;
    })

}

// -> 封装消除卡片函数
function eliminateCard() {

    let tempRes = {};

    list.res.forEach(val => {

        if (val in tempRes) {

            tempRes[val] += 1;

        } else {

            tempRes[val] = 1;

        }

    })

    for (const key in tempRes) {

        if (tempRes[key] == 3) {

            // 修改res数组
            list.res = list.res.filter(val => val != key);

            // 清空历史记录
            list.lastOne = [];

            // 跳出循环
            break;

        }

    }

    // 游戏结束
    if (list.res.length == 7) return alert("game over");

    // 渲染res数组
    $(".content .itemBox").empty();
    list.res.forEach((id, i) => {
        $(".content .itemBox").eq(i).html(`
            <div class="item">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="${id}"></use>
                </svg>
            </div>
        `)
    })



}

// -> 数据拦截函数
function proxyList() {

    // box盒子item拦截
    // console.log(list.box);
    list.box.forEach(bigSmalls => {
        bigSmalls.forEach(itemBoxs => {
            itemBoxs.forEach(item => {

                // 盒子的拦截对象
                let itemHandler = {
                    get: function (target, key) {
                        return target[key];
                    },
                    set: function (target, key, value) {

                        // 先修改数据
                        target[key] = value;

                        // 结构数据
                        let { zIndex, row, col, fade, id } = target;
                        let maxColLen = zIndex % 2 == 0 ? 7 : 6;

                        // console.log(target, key, value);

                        // 修改页面数据
                        $(".box").children().eq(zIndex).find(".itemBox").eq(maxColLen * row + col).html(``);
                        if (id) {
                            $(".box").children().eq(zIndex).find(".itemBox").eq(maxColLen * row + col).html(`
                                <div class="item ${fade ? "fade" : ""}"  data-zindex="${zIndex}" data-row="${row}" data-col="${col}">
                                    <svg class="icon" aria-hidden="true">
                                        <use xlink:href="${id}"></use>
                                    </svg>
                                </div>
                            `);
                        }

                    }

                }

                // 设置盒子数据拦截
                // console.log(item);
                let { zIndex, row, col } = item;
                list.box[zIndex][row][col] = new Proxy(list.box[zIndex][row][col], itemHandler);

            })
        })
    })

    // 左侧卡片item拦截
    list.left.forEach(item => {

        // 盒子的拦截对象
        let itemHandler = {
            get: function (target, key) {
                return target[key];
            },
            set: function (target, key, value) {

                // 先修改数据
                target[key] = value;

                // 结构数据
                let { index, id, fade } = target;

                // 修改页面数据
                $(".left .itemBox").eq(index).html(``);
                if (id) {
                    $(".left .itemBox").eq(index).html(`
                        <div class="item ${fade ? "fade" : ""}" data-index="${index}">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="${id}"></use>
                            </svg>
                        </div>
                    `)
                }

            }
        }

        // 设置盒子数据拦截
        // console.log(item);
        let { index } = item;
        list.left[index] = new Proxy(list.left[index], itemHandler);

    })

    // 右侧卡片item拦截
    list.right.forEach(item => {

        // 盒子的拦截对象
        let itemHandler = {
            get: function (target, key) {
                return target[key];
            },
            set: function (target, key, value) {

                // 先修改数据
                target[key] = value;

                // 结构数据
                let { index, id, fade } = target;

                // 修改页面数据
                // console.log(target);
                $(".right .itemBox").eq(index).html(``);
                if (id) {
                    $(".right .itemBox").eq(index).html(`
                        <div class="item ${fade ? "fade" : ""}" data-index="${index}">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="${id}"></use>
                            </svg>
                        </div>
                    `)
                }

            }
        }

        // 设置盒子数据拦截
        // console.log(item);
        let { index } = item;
        list.right[index] = new Proxy(list.right[index], itemHandler);

    })

}

// -> 更新数组函数
function updataFun(_this) {

    // 获取祖父节点
    let itemBoxParent = $(_this).parent().parent();

    let id = $(_this).find("use").attr("xlink:href");

    if (itemBoxParent.hasClass("big") || itemBoxParent.hasClass("small")) {

        // 通过data集拿到坐标
        let zIndex = parseInt($(_this).data("zindex"));
        let row = parseInt($(_this).data("row"));
        let col = parseInt($(_this).data("col"));

        // 添加历史记录
        list.lastOne.push({ patents: "box", zIndex, row, col, id });

        // 清空当前id
        list.box[zIndex][row][col].id = "";

        // 重新修改层叠
        changeFade();

    } else if (itemBoxParent.hasClass("left") || itemBoxParent.hasClass("right")) {

        // 拿到key值
        let leftRight = itemBoxParent.hasClass("left") ? "left" : "right";

        // 获取下标
        let index = $(_this).parent().index();

        // 先删除最后一个
        list[leftRight][index].id = "";

        // 获取上一个的下标
        let prevIndex = index - 1;

        if (prevIndex > -1) {
            // 上一个显示
            list[leftRight][prevIndex].fade = false;
        }

        // 添加历史记录
        list.lastOne.push({ patents: leftRight, id, index });

    } else if (itemBoxParent.hasClass("temp")) {

        // 操作listAll数组
        list.lastAll.splice($(_this).parent().index(), 1);

        // 删除原来位置偏移后的item
        $(_this).parent().remove();

        // 添加历史记录
        list.lastOne.push({ patents: "temp", id });

    }

    // 结果数组最后面添加一条数据
    list.res.push(id);

    // 调用消除卡片函数
    eliminateCard();

    // 代码执行完毕 设置可以再次点击
    clickAble = true;
}

// -> 复活的函数
function lastAllFun() {

    // 设置防抖
    clickAble = false;

    // 长度太长不执行
    if (list.lastAll.length == 7 && !list.res.length) return;

    // 清除历史记录
    list.lastOne = [];

    // 计算lastAll数组最多放几个
    let maxLen = 7 - list.lastAll.length;

    // 计算开始下标
    let startIndex = list.res.length - maxLen;

    // 判断下标是否出现负数
    startIndex = startIndex < 0 ? 0 : startIndex;

    // 把res剪切push进lastAll
    list.res.splice(startIndex, maxLen).forEach(id => {
        list.lastAll.push(id);
    });

    // 动画 剪掉的先消失
    $(".content .itemBox").each(function (i, el) {

        if (i >= startIndex)

            $(el).animate({
                opacity: 0
            }, 800, function () {

                // 渲染res布局
                $(".content .itemBox").empty();
                list.res.forEach((id, i) => {
                    $(".content .itemBox").eq(i).html(`
                        <div class="item">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="${id}"></use>
                            </svg>
                        </div>
                    `)
                })

                // 渲染temp布局
                let lastAllHtml = ``;
                list.lastAll.forEach(id => {
                    lastAllHtml += `
                        <div class="itemBox">
                            <div class="item">
                                <svg class="icon" aria-hidden="true">
                                    <use xlink:href="${id}"></use>
                                </svg>
                            </div>
                        </div>
                    `;
                })
                $(".temp").html(lastAllHtml);

                $(".content .itemBox").css("opacity", 1);

            })

    })

    // 调用渲染按钮的函数
    readerBtn();

    // 设置防抖
    clickAble = true;

}

// -> 撤回功能函数
function backstep() {

    // 设置防抖
    clickAble = false;

    // 没有历史记录不执行
    if (!list.lastOne.length) return clickAble = true;

    // 拿到最后一次的数据并解析
    let { zIndex, row, col, id, patents, index } = list.lastOne.pop();

    // 动画 res栏最后一个缓慢消失 再渲染res栏 直接删除最后一个
    $(".content .itemBox").eq(list.res.length - 1).animate({ opacity: 0 }, function () { $(this).empty(); $(this).css("opacity", 1); });

    // 删除结果栏最后一个
    list.res.pop();

    // 判断是在那个布局内
    if (patents == "box") {

        // 拦截修改数组
        list[patents][zIndex][row][col].id = id;

        // 调用解决层叠
        changeFade();

    } else if (patents == "temp") {

        // 数组最后添加一个
        list.lastAll.push(id);

        // 页面渲染多一个
        $(".temp").append(`
            <div class="itemBox">
                <div class="item">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="${id}"></use>
                    </svg>
                </div>
            </div>
        `)

    } else {

        // 拦截修改数组数据
        list[patents][index].id = id
        list[patents][index].fade = false;

        if (index - 1 > 0) {
            list[patents][index - 1].fade = true;
        }

    }

    // 调用渲染按钮的函数
    readerBtn();

    // 设置防抖
    clickAble = true;
}

// -> 播放暂停音乐函数
function palyPause(_this) {

    // 设置防抖
    clickAble = false;

    // 获取节点
    let spanEl = $(_this).find("span");
    let svgEl = $(_this).find("svg");
    let useEl = $(_this).find("use");
    let imgEl = $("aside img");

    // 获取id 设置id参数
    let id = useEl.attr("xlink:href");
    let play = "#id-bofang";
    let pause = "#id-A";

    // 判断状态
    if (id == "#id-bofang") {

        // 渲染文字
        spanEl.text("暂停");

        // 渲染图标
        useEl.attr("xlink:href", pause);

        // 播放按钮动画
        svgEl.css("animation", "btnDJ .5s linear infinite");

        // 背景草丛动画
        imgEl.css("animation", "grassDj .5s linear infinite");

        // 定时器 1秒后执行
        setTimeout(() => {

            // 播放
            $("audio")[0].play();

            // 设置防抖
            clickAble = true;

        }, 1000);

    } else {

        // 渲染文字
        spanEl.text("播放");

        // 渲染图标
        useEl.attr("xlink:href", play);

        // 清除播放按钮动画
        svgEl.css("animation", "none");

        // 背景草丛动画
        imgEl.css("animation", "none");

        // 暂停
        $("audio")[0].pause();

        // 设置防抖
        clickAble = true;

    }
}

// -> 渲染按钮的函数
function readerBtn() {

    // 渲染撤回文字
    $(".lastOne").find("span").text(`撤回(${list.lastOne.length})`);

    // 渲染撤回按钮透明度
    $(".lastOne").css("opacity", list.lastOne.length ? 1 : 0.6);

    // 渲染暂缓文字
    $(".lastAll").find("span").text(`暂缓(${7 - list.lastAll.length})`);

    // 渲染暂缓按钮透明度
    $(".lastAll").css("opacity", 7 - list.lastAll.length && list.res.length ? 1 : 0.6);

}

// -> 随机草丛的函数
function readerGrass() {

    // 随机草丛
    for (let i = 0; i < 5; i++) {

        // 随机图片文件名数字
        let num = Math.floor(Math.random() * 2);

        // 获取dom的宽高 距离屏幕距离
        let width = $("main").width();
        let height = $("main").height();
        let offsetTop = $("main").offset().top;
        let offsetLeft = $("main").offset().left;

        // 随机定位
        let top;
        let left;

        // 尾部添加标签
        top = Math.floor(Math.random() * (height));
        left = Math.floor(Math.random() * (width - 25));
        num = Math.floor(Math.random() * 2);
        $(".wrap aside").append(`<img src="./imgs/grass${num}.png" alt="" style="top:${top}px; left:${left}px;">`);

        // 尾部添加标签
        top = Math.floor(Math.random() * (height));
        left = Math.floor(Math.random() * (width - 25));
        num = Math.floor(Math.random() * 2);
        $(".wrap aside").append(`<img src="./imgs/grass${num}.png" alt="" style="top:${top}px; left:${left}px;">`);

        // 尾部添加标签
        top = Math.floor(Math.random() * offsetTop);
        left = Math.floor(Math.random() * (width - 25));
        num = Math.floor(Math.random() * 2);
        $(".wrap aside").append(`<img src="./imgs/grass${num}.png" alt="" style="top:${-top}px; left:${left}px;">`);

        // 尾部添加标签
        top = Math.floor(Math.random() * offsetTop - 25);
        left = Math.floor(Math.random() * (width - 25));
        num = Math.floor(Math.random() * 2);
        $(".wrap aside").append(`<img src="./imgs/grass${num}.png" alt="" style="top:${top + offsetTop + height - 85}px; left:${left}px;">`);


    }

}