//done
export const create = async ({ model, data = [{}], options = { validateBeforeSave: true } } = {}) => {
    return await model.create(data, options)
}//done
export const createOne = async ({ model, data = {}, options = {} } = {}) => {
    const [doc] = await model.create([data], options)
    return doc
}

//insertMany important done 
export const insertMany = async ({ model, data } = {}) => {
    return await model.insertMany(data)
}

//updateOne important done 
export const updateOne = async ({ model, filter, update, options = {} } = {}) => {
    return await model.updateOne(filter || {}, { ...update, $inc: { __v: 1 } }, options)
}

//findOne  done
export const findOne = async ({ model, filter = {}, options = {}, select = '' } = {}) => {
    const doc = model.findOne(filter).select(select)
    if (options.lean) doc.lean()
    if (options.populate) doc.populate(options.populate)
    return await doc.exec()
}
//find   important done 
export const find = async ({ model, filter = {}, options = {} } = {}) => {
    const doc = model.find(filter)
    if (options.select) doc.select(options.select)
    if (options.lean) doc.lean(options.lean)
    if (options.populate) doc.populate(options.populate)
    if (options.limit) doc.limit(options.limit)
    if (options.skip) doc.skip(options.skip)
    if (options.sort) doc.sort(options.sort)
    return await doc.exec()
}

//countDocument  done 
export const countDocument = async ({ model, filter = {} } = {}) => {
    return await model.countDocuments(filter)
}



export const paginate = async ({ model, filter = {}, options = {}, page = 1, limit = 5 } = {}) => {
    const skip = (page - 1) * limit;
    const count = await countDocument({ filter, model })
    const pages = Math.ceil(count / limit)
    const docs = await find(
        {
            model,
            filter,
            options: {
                ...options,
                skip,
                limit
            }
        })
    return { count, pages, currentPage: page, limit, docs };
}

//findBy id done 
export const findById = async ({ model, id, options = {} } = {}) => {
    const doc = model.findById(id)
    if (options.select) doc.select(options.select)
    if (options.lean) doc.lean(options.lean)
    if (options.populate) doc.populate(options.populate)
    return await doc.exec()
}
// findone and update done
export const findByIdAndUpdate = async ({ model, id, update, options = { new: true } } = {}) => {
    return await model.findByIdAndUpdate(id, { ...update, $inc: { __v: 1 } }, options)
}

// deleteone  done
export const deleteOne = async ({ model, filter } = {}) => {
    return await model.deleteOne(filter || {})
}
// deletemany done 
export const deleteMany = async ({ model, filter } = {}) => {
    return await model.deleteMany(filter || {})
}
// findoneAnddelete done 
export const findOneAnddelete = async ({ model, filter } = {}) => {
    return await model.findOneAndDelete(filter || {})
}
















