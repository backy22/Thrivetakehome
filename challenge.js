import fs from 'fs';

// Read data from files
const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
const companiesData = JSON.parse(fs.readFileSync('companies.json', 'utf8'));

// create a map with key of company_id and values of users array {company_id: users[]}
const generateCompanyUsersMap = () => {
  let companyUsersMap = new Map()

  for(let user of usersData) {
    if (user.active_status) {
      let companyUsers = companyUsersMap.get(user.company_id) || []
      companyUsers.push(user)
      companyUsersMap.set(user.company_id, companyUsers);
    }
  }

  return companyUsersMap
}

// generate user output
const generateUserOutput = (users, company) => {
  let res = ''

  if (users) {
    for (let user of users) {
      res += `\t${user.last_name}, ${user.first_name}, ${user.email}\n`
      res += `\t\tPrevious Token Balance, ${user.tokens}\n`
      res += `\t\tNew Token Balance, ${user.tokens + company.top_up}\n`
    }
  }

  return res
}

// process the data and generate output string
const processFile = (companyUsersMap) => {
  let data = ''
  companiesData.sort((a,b) => (a.id > b.id) ? 1 : -1)

  for (let company of companiesData) {
    let users = companyUsersMap.get(company.id)
    if (!users) {
      continue
    }
    data += '\n'
    data += `Company Id: ${company.id}\n`
    data += `Company Name: ${company.name}\n`
    users.sort((a,b) => (a.last_name > b.last_name) ? 1 : -1)
    let emailedUsers = users.filter((u) => u.email_status && company.email_status)
    let nonEmailedUsers = users.filter((u) => !u.email_status || !company.email_status)
    data += 'Users Emailed:\n'
    data += generateUserOutput(emailedUsers, company)
    data += 'Users Not Emailed:\n'
    data += generateUserOutput(nonEmailedUsers, company)
    data += `Total amount of top ups for ${company.name}: ${company.top_up * users.length}\n`
  }

  return data
}

// code execution
let companyUsersMap = generateCompanyUsersMap()
let fileContent = processFile(companyUsersMap)

// Write data in 'output.txt' .
fs.writeFile('output.txt', fileContent, (err) => {
  if (err) throw err;
})