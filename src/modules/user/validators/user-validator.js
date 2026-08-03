function validateUser(data, options = {}) {
  const { validatePassword = true } = options;

  if (!/^[0-9]{1,15}$/.test(String(data._id))) throw new Error("INVALID ID");
  if (!["CC", "CE", "NIT"].includes(data.document_type)) throw new Error("INVALID DOC TYPE");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})*$/;
  if (!emailRegex.test(String(data.email))) throw new Error("INVALID EMAIL");

  const nameRegex = /^(?=.{1,30}$)[\p{L}]+(?:[ '-][\p{L}]+)*$/u;
  if (!nameRegex.test(String(data.name))) throw new Error("INVALID NAME");
  if (!nameRegex.test(String(data.last_name1))) throw new Error("INVALID LASTNAME1");
  if (!nameRegex.test(String(data.last_name2))) throw new Error("INVALID LASTNAME2");

  const age = Number(data.age);
  if (!Number.isInteger(age) || age < 5 || age > 110) throw new Error("INVALID AGE");

  if (validatePassword) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/;
    if (!passwordRegex.test(String(data.password))) throw new Error("INVALID PASSWORD");
  }

  if (!/^[0-9]{7,15}$/.test(String(data.phone))) throw new Error("INVALID PHONE");
}

module.exports = { validateUser };