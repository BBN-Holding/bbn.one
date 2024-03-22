import { Footer } from "shared/footer.ts";
import { Body, Box, Label, WebGen } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh } from "../_legacy/helper.ts";
import "./flowText.css";
WebGen();
await RegisterAuthRefresh();

Body(Box(
    DynaNavigation("Home"),
    Box(
        Label("Privacy Policy", "h2"),
        Label(`Privacy Policy`, "h3"),
        Label(
            `BBN Holding and its subsidiaries and affiliates (collectively, “BBN”) are responsible for this website, including its mobile versions, and we are committed to respecting the privacy of visitors to both. BBN has implemented technical, administrative and physical measures to safeguard any personal information that we may collect.`,
        ),
        Label(`This Privacy Notice describes our practices related to personal information collected through BBN websites and mobile versions, unless there is a separate privacy notice for the website or mobile version.`),
        Label(`Does this Notice apply to all BBN Websites?`, "h3"),
        Label(
            `This Privacy Notice applies to visitors of BBN websites that link to this Privacy Notice. Individual websites for BBN entities, services and products may adopt different privacy notices because the transactions taking place on those websites may be different. If an BBN website has its own privacy notice, the provisions of that notice apply to that website.`,
        ),
        Label(`What personal information does BBN collect?`, "h3"),
        Label(
            `BBN monitors user traffic patterns throughout the website according to a user’s domain name, browser type, date and time of access, and pages viewed. This information is collected in order to measure the number of visitors to our website and to determine which areas users find useful based upon the traffic to particular areas. BBN uses this information to enhance visitors’ experience and to better prepare future content based on the interests of visitors.`,
        ),
        Label(
            `A visitor to our website may be asked to provide personal information to receive a response or some other service from BBN. The personal information that you may be requested to provide includes your name, email address and any information that you choose to provide. The collection of information will be transparent to you – you will be asked for it and will have the opportunity to decide whether or not to provide it. If you choose not to provide any of the personal information requested, BBN may be unable to complete the transaction you have requested.`,
        ),
        Label(`Your mobile provider may have a conflicting privacy position that captures personal information when you visit our website, but BBN is not responsible for and does not control how other parties may collect your information when you access our website(s).`),
        Label(`How does BBN use the personal information it collects?`, "h3"),
        Label(`Any personal information collected will only be used to:`),
        Box(
            Label(`conduct basic business operations, such as communicate with customers and business planning;`),
            Label(`provide investor services;`),
            Label(`provide the information, item or service you have requested;`),
            Label(`communicate with you about products, services and events relating to BBN;`),
            Label(`improve our products, services and websites;`),
            Label(`verify your identity to ensure security for one of the other purposes listed here;`),
            Label(`respond to a legitimate legal request from law enforcement authorities or other government regulators;`),
            Label(`investigate suspected or actual illegal activity;`),
            Label(`support the sale or transfer of all or a portion of our business or assets (including through bankruptcy); and/or`),
            Label(`conduct investigations to ensure compliance with, and comply with, legal obligations.`),
        ).addClass("list"),
        Label(`Information that individuals submit to express interest in, or be considered for, an employment opportunity with BBN is covered by the applicable https://hrtechprivacy.com/brands/indeed#privacypolicy (Indeed Privacy Policy).`),
        Label(`Except where used in support of a contract with you or to fulfill a legal obligation, our use of your personal information will be only for legitimate business interests as set forth above.`),
        Label(`Where does BBN store your information?`, "h3"),
        Label(
            `Because BBN is a global company with locations in many different countries, we may transfer your information from one legal entity to another or from one country to another in order to accomplish the purposes listed above. These countries include, at a minimum, the United States, the member states of the European Union, the United Kingdom, Canada and other countries, including some in Asia. We will transfer your personal information consistent with applicable legal requirements and only to the extent necessary for the purposes set forth above.`,
        ),
        Label(
            `BBN relies on available legal mechanisms to enable the legal transfer of personal information across borders. To the extent that BBN relies on the standard contractual clauses (also called the model clauses) or Binding Corporate Rules to authorize transfer, BBN will comply with those requirements, including where there may be a conflict between those requirements and this Notice.`,
        ),
        Label(`Does BBN use your personal information to contact you?`, "h3"),
        Label(`BBN does not use the personal information collected on this website to contact you except in response to a direct inquiry or if you register for communications in the Investors section of this site.`),
        Label(`Does BBN share the information it collects with any third parties?`, "h3"),
        Label(
            `BBN may share your Personal Information with our subsidiaries and affiliated companies (the “BBN Group”). When BBN transfers your Personal Information within the BBN Group, it will do so consistent with applicable law and BBN’s Binding Corporate Rules, which are available above in many languages.`,
        ),
        Label(
            `In addition, BBN may provide access to or share Personal Information on an as-needed basis with third parties, such as trusted service providers, consultants and contractors who are granted access to BBN facilities or systems, and with government agencies and others as required by law. BBN will only share your information outside the BBN Group to:`,
        ),
        Box(
            Label(
                `allow service providers BBN has retained to perform services on our behalf. In those cases, BBN will only share the information with service providers for the purposes outlined above. These service providers are contractually restricted from using or disclosing the information except when it is necessary to perform services on our behalf or to comply with legal requirements;`,
            ),
            Label(
                `comply with legal obligations, including but not limited, to complying with tax and regulatory obligations, sharing data with labor/trade unions and works councils, and responding to a court proceeding or a legitimate legal request from law enforcement authorities or other government regulators;`,
            ),
            Label(`investigate suspected or actual illegal activity;`),
            Label(`prevent physical harm or financial loss; or`),
            Label(`support the sale or transfer of all or a portion of our business or assets (including through bankruptcy).`),
        ).addClass("list"),
        Label(`Your personal information may also be maintained and processed by our service providers in countries other than the one in which it was collected, such as the United States, member states of the European Union, Canada and other jurisdictions.`),
        Label(`How long does BBN retain personal information?`, "h3"),
        Label(
            `BBN will retain personal information as long as needed to comply with its contractual and legal obligations. If the personal information is not subject to contractual or legal obligations, BBN will retain the data for as long as is required for the original purpose for which it was collected.`,
        ),
        Label(`How does BBN use cookies or other tracking technologies?`, "h3"),
        Label(
            `BBN uses cookies on this website. Cookies are small text files sent to and stored on users’ computers that allow websites to recognize repeat users, facilitate users’ access to websites and allow websites to compile aggregate data that will allow content improvements. Cookies do not damage users’ computers or files. If you do not want cookies to be accessible by this or any other BBN website, you should adjust the settings on your browser program to deny or disable the use of cookies. The cookies that BBN uses on this site do not identify you. The cookies simply provide BBN with aggregate, anonymous analytics about the number of people visiting particular pages on this website.`,
        ),
        Label(
            `This website may also use web beacons. A web beacon is usually a pixel on a website that can be used to track whether a user has visited a particular website to deliver targeted advertising. Web beacons are used in combination with cookies, which means that, if you turn off your browser’s cookies, the web beacons will not be able to track your activity. The web beacon will still account for a website visit, but your unique information will not be recorded.`,
        ),
        Label(`BBN Holding may also use cookies and similar technology placed by one of our business partners to enable BBN to learn which advertisements bring users to our website. For more information about cookies and other tracking technologies, click https://www.allaboutcookies.org/.`),
        Label(`What should you understand about the third-party links that may appear on this website?`, "h3"),
        Label(
            `In some instances, BBN may provide links to non-BBN controlled websites, which BBN will make reasonable efforts to identify as such. BBN does not control such third-party websites, however, and cannot be responsible for the content or the privacy practices employed by other websites.`,
        ),
        Label(`What additional information should specific users know?`, "h3"),
        Label("Parents, guardians and children:").setFontWeight("semibold").addClass("block"),
        Label(
            `This website is intended for visitors who are at least 18 years of age and the age of majority in their jurisdiction of residence. BBN does not knowingly solicit information from, or market products or services to, children. If you do not meet the age requirements set out above, please do not enter your personal information on this or any other BBN website.`,
        ),
        Label(`Residents of California:`).setFontWeight("semibold").addClass("block"),
        Label(`California Shine the Light Law:\xA0`).addClass("block"),
        Label(`California residents may annually request and obtain information that is shared with other businesses for their own direct marketing use within the prior calendar year. BBN does not share your personal information with other businesses for their own direct marketing use.`).addClass(
            "block",
        ),
        Label(`California Consumer Privacy Act:\xA0`).addClass("block"),
        Label(
            `Except for those who interact with BBN as employees and contractors, those whose information we have because of their relationship with employees and contractors (such as family members receiving health benefits or emergency contacts), job applicants, those whose information we have because of their relationship with job applicants (such as references), and those whose information we have as a result of a business-to-business interaction or relationship (such the personnel of a business customer or vendor), California residents have the right to`,
        ).addClass("block"),
        Box(
            Label(`request details about the personal information that we have about you, including the categories of information, the purpose for which we use it, with whom we share it, and specific information about what personal information we have about you specifically;`),
            Label(`request that your data be deleted; and`),
            Label(`direct a company not to sell your data, but, since BBN does not sell personal information, this does not apply.`),
        ).addClass("list"),
        Label(
            `If you are a California resident not covered by the exclusions mentioned above and you would like to exercise your rights, you should contact BBN by emailing us at support@bbn.one. Please provide your name, a way for BBN to contact you (such as an email address or telephone number) so that we can respond to your request, information about the nature of your relationship with us (for example, are you a visitor to our website or a shareowner), and details about the action that you would like us to take.\xA0 Based on your request, we will investigate to determine if we have any of your personal information. If we do have your personal information (other than that provided in your request), we will seek to verify your identity based on the personal information that we already have; the data we will request will depend on the nature of the personal information we have about you. Once we verify your identity, we will provide you with a response, indicating how we will satisfy your request or why we cannot comply with your request.`,
        ).addClass("block"),
        Label(`Users from the European Union and other countries with privacy laws:`).setFontWeight("semibold").addClass("block"),
        Label(
            `You have the right to lodge a complaint with your national or state supervisory authority. You also have the right to request access to and correction or erasure of your personal information, seek restrictions on or object to the processing of certain personal information, and seek data portability under certain circumstances. To contact BBN about a request to access, correct, erase, object or seek restrictions or portability, please use the contact methods indicated at the end of this notice.`,
        ).addClass("block"),
        Label(`Users from the United States:`).setFontWeight("semibold").addClass("block"),
        Label(
            `BBN does not collect Social Security Numbers through www.bbn.one. BBN does, however, collect Social Security Numbers where required by law, such as tax and payroll purposes for its employees. When BBN collects and/or uses Social Security Numbers, BBN will take proper care by protecting confidentiality, limiting collection, ensuring access on a need-to-know basis, implementing appropriate technical safeguards and ensuring proper disposal.`,
        ).addClass("block"),
        Label(`How might BBN change this policy?`, "h3"),
        Label(
            `As BBN expands and improves this website, we may need to update this policy. This policy may be modified from time to time without prior notice. We encourage you to review this policy on a regular basis for any changes. The date of the latest version will be identified at the bottom of the policy.`,
        ).addClass("block"),
        Label(`How can you contact BBN?`, "h3"),
        Label(
            `If you have any comments or questions, or if there are other things we can do to maximize the value of this website to you, please email support@bbn.one. If you wish to access, correct or update your personal information, or if you have questions about BBN’s privacy practices in general or a complaint, please email support@bbn.one.`,
        ).addClass("block"),
        Label(`In the event that you are located in a country that will be governed by the General Data Protection Regulation and would like to contact the local Data Protection Officer, please note that in your email, and your inquiry will be directed to the appropriate person.`).addClass("block"),
        Label(`Last updated: March 17, 2021`),
    ).addClass("flow-text"),
    Footer(),
));
