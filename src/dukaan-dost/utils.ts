export const rs = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

export const telHref = (phone: string) => "tel:" + phone.replace(/\s/g, "");
