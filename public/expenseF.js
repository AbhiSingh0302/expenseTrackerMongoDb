// console.log(window.location.href);
const ul = document.querySelector('#ulExp');
const form = document.querySelector('form');
const amount = document.getElementById('amount');
const des = document.getElementById('des');
const licategory = document.querySelectorAll('.li-category');
const firstPage = document.getElementById('first-page');
const lastPage = document.getElementById('last-page');
const rows = document.getElementById('rows');
if(localStorage.getItem('rows')){
    rows.value = localStorage.getItem('rows');
}
rows.onchange = () => {
    console.log(rows.value);
    localStorage.setItem('rows',rows.value);
    rowsVal = rows.value;
    pagination(1);
}
let rowsVal = localStorage.getItem('rows');
// const prevPage = document.getElementById('prev-page');
// const nextPage = document.getElementById('next-page');
let food = 0;
let shopping = 0;
let travelling = 0;
let bills = 0;
let others = 0;
let category;
licategory.forEach(el => {
    el.addEventListener('click',() => {
        // console.log(el.getAttribute('value'));
        category = el.getAttribute('value');
        el.id = 'selected';
        licategory.forEach(e => {
            if(e.id != 'selected'){
                $(document).ready(() => {
                    $(e).fadeOut("slow");
                })
            }
        })
    })
    
})
const razorpay = document.getElementById('razorpay');
const premiumUser = document.getElementById('premiumUser');
const leaderboard = document.getElementById('leaderboard');
const formDiv = document.getElementById('form-div');
const ulExpDiv = document.getElementById('ulExp-div');
const leaderboardDiv = document.getElementById('leaderboard-container');
const ulLeaderboard = document.getElementById('leaderboard-ul');
window.onload = async() => {
    onLoadGet();
    pagination(1);
    getLeaderboard();
    // console.log(ul);
}

firstPage.onclick = () => {
    if(page > 1){
        page--;
        pagination(page);
    }else{
        alert('it is first page');
    }
}

lastPage.onclick = () => {
    if(page < lastPageNum){
        page++;
        pagination(page);
    }else{
        alert('it is last page');
    }
}



function showPagination(expenses){
    ul.innerHTML = "";
    for(expense of expenses){
        let li = document.createElement('li');
            li.innerHTML = `${expense.amount} Rs of 
            ${expense.description} in the category of 
            ${expense.category} <button id=${expense._id}>Delete</button>`;
            li.id = `li-${expense._id}`;
            ul.appendChild(li);
            document.getElementById(expense._id).onclick = (e) => {
                removeExpense(e.target.id);
            };
    }
}
let totalItems;
let lastPageNum;
let page = 1;
async function pagination(page){
    try {
        ul.innerHTML = '';
    const getPagination = await axios.get('/expense/pagination/'+page+'?rows='+rowsVal,{
        headers: {
            'token': localStorage.getItem('token')
        }
    });
    console.log(getPagination.data);
    if(getPagination.data.expensePagination){
        showPagination(getPagination.data.expensePagination);
        // totalItems = getPagination.data.totalItems;
        // if(totalItems/rowsVal == Math.floor(totalItems/rowsVal)){
        //     lastPageNum = totalItems/rowsVal;
        // }else{
        //     lastPageNum = Math.floor(totalItems/rowsVal) + 1;
        // }
        lastPageNum = getPagination.data.totalPages
    }else{
        alert('Something is not right');
    }
} catch (error) {
    alert('Something is not right');   
}
}
function onLoadGet(){
    axios.get('http://localhost:3500/expense/all', {
        headers: {
            'token': localStorage.getItem('token')
        }
    })
        .then(result => {
            console.log("result is: ",result);
            getExpense(result.data.expenses);
            if(!result.data.isPremium){
                razorpay.style.display = 'inline';
            }else{
                premiumUser.style.display = 'inline';
                leaderboard.style.display = 'inline';
            }
        })
        .catch(err => {
            console.log(err);
        })
};
function getExpense(expenses) {
    // console.log(expenses);
    ul.innerHTML = "";
    for (expense of expenses) {
        if(expense.category == 'food'){
            food += +expense.amount
        }
        else if(expense.category == 'shopping'){
            shopping += +expense.amount
        }
        else if(expense.category == 'travelling'){
            travelling += +expense.amount
        }
        else if(expense.category == 'bills'){
            bills += +expense.amount
        }
        else{
            others += +expense.amount
        }
        let li = document.createElement('li');
        li.innerHTML = `${expense.amount} Rs of 
        ${expense.description} in the category of 
        ${expense.category} <button id=${expense._id}>Delete</button>`;
        li.id = `li-${expense._id}`;
        ul.appendChild(li);
        document.getElementById(expense._id).onclick = (e) => {
            removeExpense(e.target.id);
        };
    }
    pieChart(food,shopping,travelling,bills,others);

}
function removeExpense(id) {
    axios.get(`http://localhost:3500/expense/user/${id}`,{
        headers: {
            'token': localStorage.getItem('token')
        }
    })
        .then(result => {
            // console.log(result);
            let i = result.data.id;
            document.getElementById(`li-${i}`).remove();
            location.reload();
        })
        .catch(err => {
            // console.log(err);
            alert('something went wrong');
        })
}

form.addEventListener('submit', async (e) => {
    try {
    document.getElementById('selected').removeAttribute('id');
    // console.log(amount.value);
    e.preventDefault();
    const createdExpense = await axios.post('http://localhost:3500/expense/create', {
        'amount': amount.value,
        'description': des.value,
        'category': category
    }, {
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
        }
    })
            console.log('created: ',createdExpense);
            amount.value = "";
            des.value = "";
            licategory.forEach(e => {
                $(document).ready(() => {
                    $(e).fadeIn("slow");
            })
        })
        location.reload();
            // if(ul.children){
            //     for(let child of ul.children){
            //         child.remove();
            //     };
            // }
    } catch (error) {
        console.log(error);
        setTimeout(() => {
            document.getElementById('error').innerHTML = "";
        }, 2000)
        document.getElementById('error').innerHTML = "Something is not right";
        document.getElementById('error').style.color = "red";
        amount.value = "";
        des.value = "";
    }
})
razorpay.addEventListener('click', () => {
    axios.get('/get-premium', {
        headers: {
            'token': localStorage.getItem('token')
        }
    })
        .then(resp => {
            if(resp.data){
                rzpPayment(resp.data);
            }else{
                alert('Please try again');
            }
        })
        .catch(err => {
            if(err.response){
                console.log("Error: ", err.response.data.error.description);
                alert('Something is wrong in API')
            }else{
                alert('Something is wrong')
            }
        })
})
function rzpPayment(data) {
    var options = {
        "key": data.rzpid,
        'order_id': data.order.order_id,
        'handler': (payment) => {
            console.log(payment);
            paymentStatus(payment);
        }
    }
    const rzp1 = new Razorpay(options);
    rzp1.open();
    rzp1.on('payment.failed', (failed) => {
        console.log(failed.error.metadata);
        paymentStatus(failed.error.metadata);
    })
}
function paymentStatus(payment) {
    axios.post('/get-premium/payment', payment, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(resp => {
        console.log(resp);
        razorpay.style.display = 'none';
        premiumUser.style.display = 'inline';
        leaderboard.style.display = 'inline';
    })
    .catch(err => {
        console.log(err);
    })
}
leaderboard.onclick = () => {
    if(leaderboardDiv.style.display === "block"){
        formDiv.style.width = "55%";
        ulExpDiv.style.width = "35%";
        leaderboardDiv.style.display = "none";
    }else {
        formDiv.style.width = "40%";
        ulExpDiv.style.width = "25%";
        leaderboardDiv.style.display = "block";
    }
}
 async function getLeaderboard(){
    try {
    const leaderBoardList = await axios.get('/premium/show-leaderboard',{
        headers: {
            'token': localStorage.getItem('token')
        }
    });
    // ulLeaderboard.children.remove();
    const respList = [];
    for(let data of leaderBoardList.data){
        let totalAmount = 0;
        if(data.total_cost){
            totalAmount = data.total_cost
        }
        respList.push({
            'username': data.username,
            'total': totalAmount
        })
    }
    respList.sort((a,b) => {
        return b.total - a.total
    })
    respList.forEach(element => {
        let li = document.createElement('li');
        li.innerHTML = `${element.username} spends in total of ${element.total} Rs`;
        ulLeaderboard.appendChild(li);
    })
} catch (error) {
        console.log(error);
}
}
setTimeout(() => {
    document.querySelector('.center-body').style.display = 'none';
    document.querySelector('.canvas').style.display = 'block';
},500);
function pieChart(...values){
    console.log(values);
var oilCanvas = document.getElementById("oilChart");

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.color = '#000';

var oilData = {
    labels: [
        "Food = "+values[0],
        "Shopping = "+values[1],
        "Travelling = "+values[2],
        "Bills = "+values[3],
        "Other Expenditure = "+values[4]
    ],
    datasets: [
        {
            data: values,
            backgroundColor: [
                "#FF6384",
                "#63FF84",
                "#ffb263",
                "#8463FF",
                "#6384FF"
            ]
        }],
};

var pieChart = new Chart(oilCanvas, {
  type: 'pie',
  data: oilData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
        labels: {
            fontColor: 'white' // Change color of labels here
        }
    }
}
});
}

document.getElementById('download').addEventListener('click', async() => {
    try {
        const download = await axios.get('/download',{
            headers: {
                'token': localStorage.getItem('token')
            }
        })
        console.log('download url: ',download.data.Location);
        if(download.data.Location){
            window.open(download.data.Location);
        }else{
            console.log('download url is not found');
        }

    } catch (error) {
        console.log('error: ',error);
    }
})