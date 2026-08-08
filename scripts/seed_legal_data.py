"""
NyayaAI Legal Data Seeder — Week 3 upgrade
Seeds ChromaDB with:
  - 20 landmark Supreme Court judgments
  - 15 key IPC / BNS / CrPC sections
  - 5 Constitutional articles

Run from project root:
  cd backend && python ../scripts/seed_legal_data.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

CHROMA_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'chroma')
os.makedirs(CHROMA_DIR, exist_ok=True)

print("Loading embedding model (first run downloads ~90MB)…")
ef = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path=CHROMA_DIR)

# ── JUDGMENTS ────────────────────────────────────────────────────
jcol = client.get_or_create_collection("nyaya_judgments", embedding_function=ef,
                                        metadata={"hnsw:space": "cosine"})

JUDGMENTS = [
  {
    "id": "j001",
    "text": "Maneka Gandhi v. Union of India (1978) AIR 597 SC. The Supreme Court held that Article 21 guarantees the right to life and personal liberty. This right cannot be taken away except by a procedure that is fair, just and reasonable — not arbitrary or oppressive. The Court significantly expanded Article 21, linking it with Articles 14 and 19, establishing the golden triangle of fundamental rights. The passport impounding without hearing was held to violate natural justice.",
    "meta": {"judgment_id":"j001","case_name":"Maneka Gandhi v. Union of India","court":"Supreme Court of India","year":1978,"citation":"AIR 1978 SC 597","ipc_sections":"Article 21,Article 14,Article 19","keywords":"fundamental rights,personal liberty,due process,natural justice,passport"}
  },
  {
    "id": "j002",
    "text": "Vishaka v. State of Rajasthan (1997) 6 SCC 241. The Supreme Court laid down the Vishaka Guidelines to prevent sexual harassment of women at the workplace. Employers must prohibit harassment and establish internal complaint committees. The Court held that sexual harassment violates Articles 14, 15, 19 and 21. This led to the Sexual Harassment of Women at Workplace Act, 2013 (POSH Act).",
    "meta": {"judgment_id":"j002","case_name":"Vishaka v. State of Rajasthan","court":"Supreme Court of India","year":1997,"citation":"(1997) 6 SCC 241","ipc_sections":"Article 14,Article 15,Article 19,Article 21","keywords":"sexual harassment,workplace,women rights,Vishaka guidelines,POSH"}
  },
  {
    "id": "j003",
    "text": "D.K. Basu v. State of West Bengal (1997) 1 SCC 416. The Supreme Court issued comprehensive guidelines to prevent custodial torture and deaths. Arrested persons must be informed of grounds of arrest, have the right to inform a relative, be medically examined, have an arrest memo prepared, and have the right to consult a lawyer. Custodial violence violates Article 21. Compensation is available under public law for violations.",
    "meta": {"judgment_id":"j003","case_name":"D.K. Basu v. State of West Bengal","court":"Supreme Court of India","year":1997,"citation":"(1997) 1 SCC 416","ipc_sections":"Article 21,CrPC 50,CrPC 57","keywords":"arrest guidelines,custodial violence,torture,police,detention,compensation"}
  },
  {
    "id": "j004",
    "text": "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273. Police must not arrest as a matter of course in offences punishable with less than 7 years. Arrest is only justified to prevent further offence, ensure proper investigation, or prevent tampering with evidence. This judgment is crucial in Section 498A IPC cases to prevent misuse. Magistrates must apply their minds before authorising detention.",
    "meta": {"judgment_id":"j004","case_name":"Arnesh Kumar v. State of Bihar","court":"Supreme Court of India","year":2014,"citation":"(2014) 8 SCC 273","ipc_sections":"IPC 498A,CrPC 41,CrPC 167","keywords":"arrest,498A,domestic violence,anticipatory bail,misuse,checklist"}
  },
  {
    "id": "j005",
    "text": "Satender Kumar Antil v. CBI (2022) 10 SCC 51. Bail is the rule, jail is the exception. Courts must consider nature of accusation, severity of punishment, character of evidence, and flight risk before denying bail. High Courts and Sessions Courts must dispose bail applications expeditiously. Undertrial prisoners should not be kept in custody longer than necessary.",
    "meta": {"judgment_id":"j005","case_name":"Satender Kumar Antil v. CBI","court":"Supreme Court of India","year":2022,"citation":"(2022) 10 SCC 51","ipc_sections":"CrPC 437,CrPC 438,CrPC 439","keywords":"bail,undertrial,personal liberty,Article 21,guidelines,expeditious"}
  },
  {
    "id": "j006",
    "text": "Navtej Singh Johar v. Union of India (2018) 10 SCC 1. The Supreme Court decriminalised consensual same-sex relations between adults by reading down Section 377 IPC. The Court held that Section 377 violated Articles 14, 15, 19 and 21 of the Constitution. Sexual orientation is an essential attribute of identity. The right to dignity and privacy includes the right to choose one's partner.",
    "meta": {"judgment_id":"j006","case_name":"Navtej Singh Johar v. Union of India","court":"Supreme Court of India","year":2018,"citation":"(2018) 10 SCC 1","ipc_sections":"IPC 377,Article 14,Article 15,Article 21","keywords":"LGBTQ,consensual sex,decriminalisation,privacy,dignity,377"}
  },
  {
    "id": "j007",
    "text": "K.S. Puttaswamy v. Union of India (2017) 10 SCC 1. The Supreme Court unanimously held that the right to privacy is a fundamental right under Article 21. Privacy includes bodily integrity, informational privacy, and the right to make personal choices. The judgment overruled M.P. Sharma and Kharak Singh. Restrictions on privacy must satisfy the proportionality test.",
    "meta": {"judgment_id":"j007","case_name":"K.S. Puttaswamy v. Union of India","court":"Supreme Court of India","year":2017,"citation":"(2017) 10 SCC 1","ipc_sections":"Article 21,Article 14","keywords":"right to privacy,Aadhaar,data protection,fundamental right,proportionality"}
  },
  {
    "id": "j008",
    "text": "Shayara Bano v. Union of India (2017) 9 SCC 1. Triple talaq (talaq-e-biddat) was held unconstitutional by a 3-2 majority. The practice of pronouncing talaq three times in one sitting was held manifestly arbitrary under Article 14. The Muslim Women (Protection of Rights on Marriage) Act 2019 subsequently criminalised triple talaq.",
    "meta": {"judgment_id":"j008","case_name":"Shayara Bano v. Union of India","court":"Supreme Court of India","year":2017,"citation":"(2017) 9 SCC 1","ipc_sections":"Article 14,Article 21,Article 25","keywords":"triple talaq,Muslim personal law,divorce,unconstitutional,women rights"}
  },
  {
    "id": "j009",
    "text": "Joseph Shine v. Union of India (2018) 2 SCC 189. Section 497 IPC (adultery) was struck down as unconstitutional. The provision treated women as property of husbands and violated Articles 14, 15 and 21. A married woman has the same autonomy as a man. The judgment affirmed that the Constitution treats men and women as equals.",
    "meta": {"judgment_id":"j009","case_name":"Joseph Shine v. Union of India","court":"Supreme Court of India","year":2018,"citation":"(2018) 2 SCC 189","ipc_sections":"IPC 497,Article 14,Article 15,Article 21","keywords":"adultery,Section 497,gender equality,unconstitutional,women autonomy"}
  },
  {
    "id": "j010",
    "text": "Nirbhaya Case — Mukesh v. State (NCT of Delhi) (2017) 6 SCC 1. Death penalty upheld for gang rape and murder. The Court held this fell within the rarest of rare category. Collective conscience of society shocked. Aggravating factors included brutality, number of offenders, age of victim, and absence of remorse. Section 376 IPC and Section 302 IPC applied.",
    "meta": {"judgment_id":"j010","case_name":"Mukesh v. State (NCT of Delhi)","court":"Supreme Court of India","year":2017,"citation":"(2017) 6 SCC 1","ipc_sections":"IPC 376,IPC 302","keywords":"gang rape,death penalty,rarest of rare,Nirbhaya,Section 376,murder"}
  },
  {
    "id": "j011",
    "text": "Lalita Kumari v. Govt. of U.P. (2014) 2 SCC 1. Registration of FIR is mandatory when information discloses cognizable offence. Police cannot conduct preliminary inquiry before registering FIR in cognizable offence cases. Delay in FIR registration is serious matter. Victim has right to approach Superintendent of Police if police refuse to register FIR under Section 154(3) CrPC.",
    "meta": {"judgment_id":"j011","case_name":"Lalita Kumari v. Govt. of U.P.","court":"Supreme Court of India","year":2014,"citation":"(2014) 2 SCC 1","ipc_sections":"CrPC 154,CrPC 154(3)","keywords":"FIR,mandatory registration,cognizable offence,police,complaint,SP complaint"}
  },
  {
    "id": "j012",
    "text": "Indira Sawhney v. Union of India (1992) Supp 3 SCC 217. The Mandal Commission judgment upheld 27% OBC reservations but struck down the 10% economically weaker section reservation. Total reservations cannot exceed 50% except in extraordinary circumstances. Creamy layer exclusion from OBC benefits is constitutional. The 50% ceiling is a rule of caution.",
    "meta": {"judgment_id":"j012","case_name":"Indira Sawhney v. Union of India","court":"Supreme Court of India","year":1992,"citation":"(1992) Supp 3 SCC 217","ipc_sections":"Article 16,Article 15","keywords":"reservation,OBC,Mandal,50% cap,creamy layer,backward classes"}
  },
  {
    "id": "j013",
    "text": "M.C. Mehta v. Union of India (Oleum Gas Leak) (1987) 1 SCC 395. The absolute liability principle: enterprises engaged in hazardous activities are absolutely liable for harm caused even without negligence. No exceptions apply — unlike Rylands v. Fletcher. This is a stricter standard than strict liability. Compensation must be commensurate with the magnitude and capacity of the enterprise.",
    "meta": {"judgment_id":"j013","case_name":"M.C. Mehta v. Union of India (Oleum Gas Leak)","court":"Supreme Court of India","year":1987,"citation":"(1987) 1 SCC 395","ipc_sections":"Article 21,Article 32","keywords":"absolute liability,hazardous industry,compensation,environment,gas leak,tort"}
  },
  {
    "id": "j014",
    "text": "Shreya Singhal v. Union of India (2015) 5 SCC 1. Section 66A of the Information Technology Act 2000 struck down as unconstitutional. The provision was vague, overbroad and chilling free speech. Online speech is protected by Article 19(1)(a). Restrictions must fall within Article 19(2) — public order, incitement, defamation — not mere annoyance or inconvenience.",
    "meta": {"judgment_id":"j014","case_name":"Shreya Singhal v. Union of India","court":"Supreme Court of India","year":2015,"citation":"(2015) 5 SCC 1","ipc_sections":"IT Act 66A,Article 19","keywords":"66A,free speech,internet,online speech,unconstitutional,chilling effect"}
  },
  {
    "id": "j015",
    "text": "State of Maharashtra v. Madhkar Narayan (1991) 1 SCC 57. Even a woman of easy virtue is entitled to privacy. No one can invade her privacy. The accused cannot use the character of the victim to escape punishment for sexual assault. Past conduct or character of a rape victim is irrelevant and inadmissible. Victim's testimony, if credible, is sufficient for conviction without corroboration.",
    "meta": {"judgment_id":"j015","case_name":"State of Maharashtra v. Madhkar Narayan","court":"Supreme Court of India","year":1991,"citation":"(1991) 1 SCC 57","ipc_sections":"IPC 375,IPC 376","keywords":"rape victim,character evidence,privacy,testimony,corroboration,sexual assault"}
  },
  {
    "id": "j016",
    "text": "People's Union for Civil Liberties v. Union of India (2003) 4 SCC 399. Right to food is part of right to life under Article 21. The State is obligated to provide food to the hungry and destitute. Midday meal scheme in government schools made mandatory. The Court directed implementation of various food security schemes including PDS, ICDS, and anganwadi services.",
    "meta": {"judgment_id":"j016","case_name":"PUCL v. Union of India","court":"Supreme Court of India","year":2003,"citation":"(2003) 4 SCC 399","ipc_sections":"Article 21","keywords":"right to food,Article 21,midday meal,food security,PDS,welfare"}
  },
  {
    "id": "j017",
    "text": "Hussainara Khatoon v. Home Secretary, State of Bihar (1979) 3 SCR 532. Speedy trial is a fundamental right under Article 21. Undertrial prisoners cannot be detained longer than the maximum sentence for the offence. Bail should be granted where trial is prolonged. The State has a duty to provide free legal aid to the poor accused. Legal aid is a constitutional imperative.",
    "meta": {"judgment_id":"j017","case_name":"Hussainara Khatoon v. Home Secretary Bihar","court":"Supreme Court of India","year":1979,"citation":"(1979) 3 SCR 532","ipc_sections":"Article 21,Article 39A","keywords":"speedy trial,undertrial,legal aid,free legal service,fundamental right,bail"}
  },
  {
    "id": "j018",
    "text": "Bachan Singh v. State of Punjab (1980) 2 SCC 684. Death penalty is constitutional. Capital punishment can only be imposed in the rarest of rare cases. Aggravating and mitigating circumstances must both be considered. Sentencing courts must record special reasons. The balance sheet of aggravating and mitigating factors must be drawn. Life imprisonment is the rule; death is the exception.",
    "meta": {"judgment_id":"j018","case_name":"Bachan Singh v. State of Punjab","court":"Supreme Court of India","year":1980,"citation":"(1980) 2 SCC 684","ipc_sections":"IPC 302,Article 21","keywords":"death penalty,rarest of rare,capital punishment,sentencing,mitigating factors,murder"}
  },
  {
    "id": "j019",
    "text": "S.R. Bommai v. Union of India (1994) 3 SCC 1. Imposition of President's Rule under Article 356 is subject to judicial review. Floor test must be conducted before recommending President's Rule. Secularism is a basic feature of the Constitution. A government that promotes communal agenda loses its right to continue. President's Rule cannot be used for political purposes.",
    "meta": {"judgment_id":"j019","case_name":"S.R. Bommai v. Union of India","court":"Supreme Court of India","year":1994,"citation":"(1994) 3 SCC 1","ipc_sections":"Article 356,Article 74","keywords":"President's Rule,Article 356,secularism,floor test,judicial review,federalism"}
  },
  {
    "id": "j020",
    "text": "Consumer Education and Research Centre v. Union of India (1995) 3 SCC 42. Right to health and medical care is a fundamental right under Article 21. Employers are obligated to provide health care facilities to workmen. Occupational diseases must be compensated. The right to live with human dignity includes the right to social security and health.",
    "meta": {"judgment_id":"j020","case_name":"Consumer Education and Research Centre v. Union of India","court":"Supreme Court of India","year":1995,"citation":"(1995) 3 SCC 42","ipc_sections":"Article 21","keywords":"right to health,medical care,workers rights,occupational disease,fundamental right"}
  },
]

jcol.upsert(
    ids=[j["id"] for j in JUDGMENTS],
    documents=[j["text"] for j in JUDGMENTS],
    metadatas=[j["meta"] for j in JUDGMENTS],
)
print(f"✅  Seeded {len(JUDGMENTS)} judgments")

# ── LEGAL SECTIONS ───────────────────────────────────────────────
scol = client.get_or_create_collection("nyaya_sections", embedding_function=ef,
                                        metadata={"hnsw:space": "cosine"})

SECTIONS = [
  {"id":"ipc_302","text":"IPC Section 302 — Punishment for murder. Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. Murder requires intention to cause death or knowledge that act will likely cause death.","meta":{"act":"IPC","section":"302","title":"Punishment for murder","bailable":"false","cognizable":"true"}},
  {"id":"ipc_376","text":"IPC Section 376 — Punishment for rape. Rigorous imprisonment not less than ten years, extendable to life. Aggravated rape (of minors, gang rape, rape by public servant) carries minimum 20 years to life. No suspension of sentence except in special circumstances.","meta":{"act":"IPC","section":"376","title":"Punishment for rape","bailable":"false","cognizable":"true"}},
  {"id":"ipc_498a","text":"IPC Section 498A — Cruelty by husband or relatives. Imprisonment up to 3 years and fine. Cruelty means conduct likely to drive the woman to suicide or cause grave injury, or harassment to coerce her or relatives to meet unlawful demand for property (dowry). Cognizable and non-bailable.","meta":{"act":"IPC","section":"498A","title":"Cruelty by husband or relatives","bailable":"false","cognizable":"true"}},
  {"id":"ipc_420","text":"IPC Section 420 — Cheating and dishonestly inducing delivery of property. Imprisonment up to 7 years and fine. Requires dishonest or fraudulent inducement causing delivery of property or alteration of a valuable security.","meta":{"act":"IPC","section":"420","title":"Cheating — delivery of property","bailable":"false","cognizable":"true"}},
  {"id":"ipc_406","text":"IPC Section 406 — Criminal breach of trust. Imprisonment up to 3 years or fine or both. Applies to entrustment of property that is dishonestly misappropriated or converted. Commonly applies in stridhan (wife's property) cases.","meta":{"act":"IPC","section":"406","title":"Criminal breach of trust","bailable":"false","cognizable":"true"}},
  {"id":"ipc_354","text":"IPC Section 354 — Assault or use of criminal force to woman with intent to outrage her modesty. Imprisonment minimum 1 year up to 5 years and fine. Cognizable and non-bailable. Aggravated forms under 354A (sexual harassment), 354B (disrobing), 354C (voyeurism), 354D (stalking).","meta":{"act":"IPC","section":"354","title":"Assault or criminal force to outrage modesty","bailable":"false","cognizable":"true"}},
  {"id":"ipc_307","text":"IPC Section 307 — Attempt to murder. Imprisonment up to 10 years and fine; if hurt is caused, imprisonment up to life. Requires act done with intention or knowledge that the act if it caused death would amount to murder.","meta":{"act":"IPC","section":"307","title":"Attempt to murder","bailable":"false","cognizable":"true"}},
  {"id":"crpc_154","text":"CrPC Section 154 — First Information Report (FIR). Every information relating to cognizable offence must be reduced to writing by police officer and read over to informant. FIR registration is mandatory; police cannot refuse. Informant can send written information to SP if police refuse. Copy of FIR must be given to informant free of cost.","meta":{"act":"CrPC","section":"154","title":"First Information Report","bailable":"n/a","cognizable":"n/a"}},
  {"id":"crpc_41","text":"CrPC Section 41 — Arrest without warrant. Police may arrest without warrant for cognizable offences. For offences punishable up to 7 years, arrest only if: necessary to prevent further offence, proper investigation, or prevent tampering with evidence. Officer must record written reasons. Magistrate must be satisfied with reasons for remand.","meta":{"act":"CrPC","section":"41","title":"Arrest without warrant","bailable":"n/a","cognizable":"n/a"}},
  {"id":"crpc_437","text":"CrPC Section 437 — Bail in non-bailable offences by Magistrate. Court may grant bail unless there are reasonable grounds to believe accused is guilty of offence punishable with death or life imprisonment. Factors: nature of accusation, severity of punishment, likelihood of fleeing, safety of society. Special powers for women, children, sick or infirm.","meta":{"act":"CrPC","section":"437","title":"Bail in non-bailable offences","bailable":"n/a","cognizable":"n/a"}},
  {"id":"crpc_438","text":"CrPC Section 438 — Anticipatory bail. Sessions Court or High Court may direct release on bail in anticipation of arrest. Conditions may be imposed. Application must show apprehension of arrest and reasonable grounds. Not available for offences punishable with death or life imprisonment in some states.","meta":{"act":"CrPC","section":"438","title":"Anticipatory bail","bailable":"n/a","cognizable":"n/a"}},
  {"id":"const_21","text":"Article 21 — Protection of life and personal liberty. No person shall be deprived of his life or personal liberty except according to procedure established by law. Interpreted to include rights to privacy, health, education, livelihood, speedy trial, legal aid, dignity, and clean environment.","meta":{"act":"Constitution","section":"21","title":"Right to life and personal liberty","bailable":"n/a","cognizable":"n/a"}},
  {"id":"const_14","text":"Article 14 — Right to Equality. The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India. Prohibits arbitrary state action. Laws must be non-arbitrary and based on intelligible differentia with rational nexus to the object sought to be achieved.","meta":{"act":"Constitution","section":"14","title":"Right to equality","bailable":"n/a","cognizable":"n/a"}},
  {"id":"const_19","text":"Article 19 — Protection of certain rights regarding freedom of speech. Includes freedom of speech and expression, assembly, association, movement, residence, and profession. Restrictions are permitted on grounds of sovereignty, security, public order, decency, morality, contempt, defamation, or incitement. Restrictions must be reasonable.","meta":{"act":"Constitution","section":"19","title":"Freedom of speech and expression","bailable":"n/a","cognizable":"n/a"}},
  {"id":"rti_6","text":"RTI Act Section 6 — Request for obtaining information. Any person desirous of obtaining information must make a request in writing or electronically to the Public Information Officer of the concerned public authority. No reason need be given for seeking information. Application fee is Rs. 10. Must be replied to within 30 days. BPL applicants are exempt from fee.","meta":{"act":"RTI Act 2005","section":"6","title":"Request for information","bailable":"n/a","cognizable":"n/a"}},
]

scol.upsert(
    ids=[s["id"] for s in SECTIONS],
    documents=[s["text"] for s in SECTIONS],
    metadatas=[s["meta"] for s in SECTIONS],
)
print(f"✅  Seeded {len(SECTIONS)} legal sections")
print(f"\n📁  ChromaDB at: {CHROMA_DIR}")
print(f"    Judgments : {jcol.count()}")
print(f"    Sections  : {scol.count()}")
print("\n🚀  Run the backend: uvicorn app.main:app --reload --port 8000")
