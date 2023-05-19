// Note: Currently, we use the REST API for Operand because of some unpkg/webpack issues.
// In the future, we'd like to use the SDK (https://github.com/operandinc/typescript-sdk).
// If someone knows how to do this w/o breaking the Operand typescript-sdk for npm users,
// please let Morgan (@morgallant) and/or (@_jzhao) know! <3

const apiKey = "{{$.Site.Data.config.search.operandApiKey}}"
const indexId = "{{$.Site.Data.config.search.operandIndexId}}"

function parseSearchResults(searchResults) {
  return searchResults.matches.map((m) => ({
    content: m.content,
    title: searchResults.objects[m.objectId].properties.properties._title.text,
    url: searchResults.objects[m.objectId].properties.properties._url.text,
  }))
}

async function searchContents(query) {
  const result = await fetch("https://mcp.operand.ai/operand.v1.OperandService/Search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify({
      query: query,
      maxResults: 10,
      parent_id: indexId,
    }),
    mode: "no-cors",
  })
  if (result.ok) {
    return parseSearchResults(await result.json())
  } else {
    console.error(result)
  }
  console.log(JSON.stringify({
      query: query,
      limit: 10,
      parent_id: indexId,
    }))
}

function debounce(func, timeout = 200) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}

registerHandlers(
  debounce((e) => {
    let term = e.target.value
    if (term !== "") {
      searchContents(term).then((results) => displayResults(term, results))
    }
  }),
)
