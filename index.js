const puppeteer = require('puppeteer');

// 필요시 아래의 개인정보 수정
let loginId = process.argv[2];
let loginPw = process.argv[3];
let productId = parseInt(process.argv[4], 10);
let sp = parseInt(process.argv[5], 10);
// console.log(process.argv);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--disable-infobars', '--start-maximized']
  });
  const page = (await browser.pages())[0];
  await page.setViewport({width: 1920, height: 1080});
  await page.goto('https://id.payco.com/oauth2.0/authorize?serviceProviderCode=TKLINK&scope=&response_type=code&state=1&client_id=Z9Ur2WLH9rB59Gy4_cJ3&redirect_uri=http://www.ticketlink.co.kr/auth/callback?selfRedirect=N&userLocale=ko_KR');
  await page.$eval('#id', (el, id) => el.value = id, loginId); // id 입력
  await page.$eval('#pw', (el, pw) => el.value = pw, loginPw); // pw 입력
  await page.click('#loginBtn');
  await page.waitForNavigation();
  // await page.goto('https://ticketlink.co.kr'); // 로그인 확인
  await page.goto(`http://www.ticketlink.co.kr/reserve/product/${productId}/schedule`); // product 뒤에 원하는 공연 번호 입력
  // page.setRequestInterception(true);
  // page.on('request', interceptedRequest => {
  //   console.log(interceptedRequest);
  //   interceptedRequest.continue();
  // });
  let roundNum = 0;
  let dateNum = 0;
  let dateData = [];
  let roundData = [];
  let newPage = [];
  let totalNum = 0;

  do {
    const dateResult = await page.evaluate(async (id) => {
      return fetch('http://www.ticketlink.co.kr/api/reserve/dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(id)
      })
        .then(response => response.json());

    }, productId);
    // console.log('dateResult: ', dateResult);
    totalNum = Object.keys(dateResult.data).length;
    let tempData = [];
    for (i = 0; i < totalNum; i++) {
      tempData.push(dateResult.data[i].productDate);
    }
    dateData = [...new Set(tempData)];
    // console.log('dateData: ', dateData);
    dateNum = dateData.length;
    // console.log('dateNum: ', dateNum);
  } while (dateNum == 0);

  let tCount = 0;

  for (count = 0; count < dateNum; count++) {
    do {

      const roundResult = await page.evaluate(async (id, date) => {
        return fetch('http://www.ticketlink.co.kr/api/reserve/round', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({productId: id, productDate: date}) // 원하는 공연 번호와 날짜를 yyyy.mm.dd 형식으로 입력
        })
          .then(response => response.json());
      }, productId, dateData[count]);
      // console.log('count: ', count);
      // console.log('roundResult: ', roundResult);
      roundNum = Object.keys(roundResult.data).length;
      // console.log('roundNum: ', roundNum);
      if (roundNum != 0) {
        for (i = 0; i < roundNum; i++) {
          roundData.push(roundResult.data[i].scheduleId);
        }
      }
      // console.log('roundData: ', roundData);
    } while (roundNum == 0);
    roundNum = 0;
  }

  if (sp == 0) {
    for (tCount = 0; tCount < roundData.length; tCount++) {
      newPage[tCount] = await browser.newPage();
      await newPage[tCount].setViewport({width: 1920, height: 1080});
      newPage[tCount].goto(`http://www.ticketlink.co.kr/reserve/plan/schedule/${roundData[tCount]}`);
      // console.log('tCount: ', tCount);
    }
  } else {
    let i = 0;
    for (tCount = 0; tCount < roundData.length; tCount++) {
      if (tCount + 1 != sp) {
        continue;
      }
      newPage[i] = await browser.newPage();
      await newPage[i].setViewport({width: 1920, height: 1080});
      newPage[i].goto(`http://www.ticketlink.co.kr/reserve/plan/schedule/${roundData[tCount]}`);
      // console.log('tCount: ', tCount);
      i++;
    }
  }

  // await browser.close();
})();
