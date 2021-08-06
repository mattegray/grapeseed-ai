let parseBoolean = (string) => {
    if (!string) {
        return false
    }
    let bool = true
    switch (string.toLowerCase()) {
        case 'true':
            return bool
        case 'false':
            return !bool
    }
}

module.exports = {
    parseBoolean,
}
