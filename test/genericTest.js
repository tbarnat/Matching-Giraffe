/* GENERIC TEST */

// req_res_arr: {action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}

exports.genericTest = async (testName, testUser, testPswd, req_res_arr) => {

  let init = require('./init_for_tests').initTestServer
  console.log('jak to')
  if (!(await init())) {
    console.log('ERROR: db initialization failed or server error occurred')
    return null
  }
  setTimeout(async () => {
    const Client = require('../client-frontend/build/dist/Client').default;
    let client = new Client('ws://localhost:8080')
    let test = require('tape');

    let requestId = client.login(testUser, testPswd)
    let resultLogin = await client.waitFor(requestId)
    if (!resultLogin.success) {
      console.log('ERROR: login')
      return null
    }

    test(testName, async (t) => {

      let assertForSingleRequest = async (req_res) => {
        let response = await client.sendAndWait(req_res.action, req_res.reqData)
        let reqData = JSON.stringify(req_res.reqData)

        console.log('\n\n')

        // comment for title
        if (reqData.length < 50) {
          t.comment(`:         --> ${req_res.action}   --> ${reqData}`)
        } else {
          t.comment(`:         --> ${req_res.action}   --> ..long-input..`)
        }
        //assertions
        console.log(response)

        t.equal(req_res.success, response.success)
        if (!req_res.success && !response.success && req_res.errorMsg) {
          t.equal(req_res.errorMsg, response.data.errorMsg)
        } else if (req_res.success && response.success && req_res.data) {
          t.equal(req_res.resData, response.data)
        }
      }

      for (let req_res of req_res_arr) {
        await assertForSingleRequest(req_res)
      }
      t.end()
      process.exit()
    })
  }, 500) //time for a server to start
}
