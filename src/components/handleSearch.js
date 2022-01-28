function handleSearch(searchText) {
    console.log("Get search results: input is ", searchText);
    fetch('http://localhost:5000/getSearch', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            search_text: searchText,
        })
    })
        .then(res => res.json())
        .then((data) => {
            this.setState({ resultList: data });
        })
        .catch(console.log);
    // const resultList = [
    //     {'conceptId' : 1, 'conceptName' : 'mock concept 1', 'inSeed' : false},
    //     {'conceptId' : 2, 'conceptName' : 'mock concept 2', 'inSeed' : false},
    //     {'conceptId' : 3, 'conceptName' : 'mock concept 3', 'inSeed' : false},
    //     {'conceptId' : 4, 'conceptName' : 'mock concept 4', 'inSeed' : false},
    // ]
    // make sure the seed concepts flag is correct
    const seedList = [...this.state.seedList];
    const resultList = [...this.state.resultList];
    resultList.forEach(result => {
        result.inSeed = false;
        seedList.forEach(seed => {
            if (result.conceptId === seed.conceptId) {
                result.inSeed = true;
            }
        });
    });
    this.setState({ resultList: resultList });
    console.log('resultList after search :', this.state.resultList);
}
