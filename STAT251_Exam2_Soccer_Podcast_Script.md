# STAT 251 Exam 2 Podcast — Soccer Edition

> This is the locked narration-and-math script for the audio review and Claude Code video. All professor examples are labeled; added analogies are soccer-based. Mathematical display lines are visual references; narrate the adjacent explanation naturally.


## INTRO — WHAT THIS EXAM IS REALLY ABOUT

Welcome to the STAT 251 Exam 2 soccer edition. You do not need to know any of these ideas beforehand. Imagine we are in a goalkeeper session: I explain the idea, we practice it on the pitch, and then we connect it to the exact calculation your professor could ask for. The instructor’s original voter, GPA, and customer-arrival examples stay in the episode; our new supporting examples come entirely from soccer.

The professor’s Exam 2 guide narrows the scope in a useful way. Module 4 is continuous random variables only. Module 5 is confidence intervals. Module 6 is hypothesis testing. The exam gives you a z-table and a t-table, and the professor specifically wants you to use those tables rather than a calculator’s built-in normal calculation. So this podcast is going to teach you not just the formulas, but how to recognize which formula and which table belong to the problem in front of you.

Before anything else, here is the big picture. Statistics is usually trying to solve one of two problems. First, we might know a probability model and want to calculate the chance of something happening. That is mostly Module 4. Second, we might have a sample and want to learn something about a much larger population. That is Modules 5 and 6.

Think about soccer. Suppose you are studying penalty kicks. If you already know a goalkeeper saves 20 percent of penalties, you might ask, what is the probability of a certain outcome? That is probability. But suppose you do not know the true save percentage of all goalkeepers, and you watch a sample of games to estimate it. Now you are doing inference. Confidence intervals estimate the unknown number. Hypothesis tests challenge a specific claim about the unknown number.

That difference — probability versus inference — is the first thing I want you to keep in your head.


## CHAPTER 1 — POPULATION, SAMPLE, PARAMETER, STATISTIC

Let’s define four words because they show up everywhere.

A population is the whole group you care about. For example, all college goalkeepers in the country are one possible population. Your professor also uses all engineering students when discussing GPA; that is the population in the original lecture example.

A sample is the smaller group you actually observe. Maybe you randomly collect GPA data from 114 students. Those 114 students are your sample.

A parameter is a number describing the population. The true population mean is written with the Greek letter mu. The true population proportion is written p. Parameters are usually unknown. That is why we are doing statistics.

A statistic is a number calculated from the sample. The sample mean is x-bar, or sometimes y-bar in your professor’s slides. The sample proportion is p-hat. The sample standard deviation is s.

The whole point of inference is this: use the statistic you can calculate to learn about the parameter you cannot directly see.

If a question says, “Thirty-two percent of the sampled students…” that is a sample proportion, p-hat. If it says, “the true proportion of all students…” that is the population proportion, p.

If the question says, “the average sprint time of 50 sampled goalkeepers,” that is a sample mean, written as x-bar. If it says “the true average sprint time of all college goalkeepers,” that is a population mean, written as mu.

This distinction matters because formulas are built around the parameter you are trying to estimate or test.


## CHAPTER 2 — CONTINUOUS RANDOM VARIABLES: WHAT ARE YOU LOOKING AT?

Module 4 on this exam is continuous random variables only.

A random variable is a numerical way to represent an uncertain outcome. A continuous random variable can take any value within an interval. Soccer examples include sprint time, shot speed, distance covered, reaction time, or how long until a goal. A value might be 0.420 seconds, 0.4201 seconds, or 0.42017 seconds.

If a soccer sprint time can be 4.20 seconds, 4.201 seconds, 4.2017 seconds, and so on, that is continuous.

For a continuous random variable, the most important picture is a curve called a probability density function, or PDF.

The PDF is not the probability at one exact point. It is a density curve. Probability comes from AREA under the curve.

This is a huge exam idea: for a continuous random variable, the probability that X equals one exact value is zero. P of X equals exactly 5 is zero. The useful probabilities are intervals, like P that X is between 4 and 6, or P that X is less than 5.

The total area under a valid PDF must equal 1, because 1 means 100 percent probability. The density also cannot be negative.

If the question gives you a PDF f of x and asks for a probability between a and b, conceptually you integrate the PDF from a to b. In words: probability equals area under the density curve over the event.

\[f(x)\ge0,\qquad \int_{-\infty}^{\infty}f(x)\,dx=1,\qquad P(X=x)=0\]

Now, there is another function called the CDF, the cumulative distribution function. It is written F of x. The definition is F of x equals P of X less than or equal to x.

\[P(a<X<b)=\int_a^b f(x)\,dx\]

For continuous data, the CDF is the accumulated probability to the left. If X is the time until the next goal, F(20) means the probability the goal arrives within 20 minutes. This is how we translate the curve into an answer.

That gives you some useful shortcuts. P of X greater than x equals 1 minus F of x. P of a less than X less than or equal to b equals F of b minus F of a. For a continuous variable, it does not matter whether the endpoint is less-than or less-than-or-equal, because a single exact point has probability zero.

\[F(x)=P(X\le x)=\int_{-\infty}^{x} f(t)\,dt,\quad P(a<X<b)=F(b)-F(a)\]

The mean, written as mu or E of X, is the expected center. Variance describes spread; standard deviation is the square root of variance. These are not just definitions: the integral formulas let you calculate center and spread from a given PDF.

\[\mu=E[X]=\int_{-\infty}^{\infty}x f(x)\,dx\]
\[\sigma^2=\operatorname{Var}(X)=E[X^2]-\mu^2=\int(x-\mu)^2f(x)\,dx\]

Variance measures spread around the mean. One convenient form is E of X squared minus mu squared. Standard deviation is the square root of variance.

Imagine goalkeeper reaction times with mean 0.40 seconds. If the standard deviation is only 0.02 seconds, the group is consistent. If the standard deviation is 0.10 seconds, reaction times vary much more. The mean could stay exactly the same while the spread changes.


## CHAPTER 3 — UNIFORM, EXPONENTIAL, AND NORMAL

The professor’s guide identifies three continuous distributions you need to recognize: Uniform, Exponential, and Normal.

First, Uniform.

Use Uniform when every value within an interval has the same probability density. The graph is a flat rectangle. Suppose the coach randomly chooses when the shooting drill starts, equally across the 20 minutes after warmups. Let X be the delay before the drill begins.

\[X\sim U(a,b),\qquad f(x)=\begin{cases}\frac{1}{b-a},& a\le x\le b\\0,&\text{otherwise}\end{cases}\]

If X is Uniform from a to b, the mean is the midpoint and the variance depends on the square of the interval width. In the drill example, a is zero, b is twenty, and the average start delay is ten minutes.

\[E[X]=\frac{a+b}{2},\quad \operatorname{Var}(X)=\frac{(b-a)^2}{12}\]

For a Uniform interval, probability is just desired interval length divided by total interval length. If the drill can start anywhere between zero and 20 minutes, the chance of starting from five to ten minutes is five divided by twenty, or 25 percent.

\[P(c<X<d)=\frac{d-c}{b-a}=\frac{10-5}{20-0}=0.25\]

Recognize Uniform from wording like “equally likely anywhere between…” or a flat density.

Second, Exponential.

Use Exponential for time until the first event when arrivals happen at a constant average rate. An idealized soccer example is the time until the next goal if goals happened independently at a constant average rate. Real soccer is not perfectly constant-rate, but the model helps explain the math. The professor’s customer-arrival example is the same type of question.

For an Exponential random variable X, the PDF starts high and decreases as the waiting time increases. The parameter lambda is an event rate measured per time unit. Do not confuse a rate of five per hour with a waiting time of five hours.

\[X\sim\operatorname{Exp}(\lambda),\quad f(x)=\lambda e^{-\lambda x},\quad F(x)=1-e^{-\lambda x},\quad x\ge0\]

The mean wait and standard deviation are both one divided by lambda, while the variance is one divided by lambda squared. For example, if an idealized match situation has a rate of two goals per hour, the average waiting time is half an hour.

\[E[X]=\frac1\lambda,\qquad \operatorname{Var}(X)=\frac1{\lambda^2},\qquad P(X>x)=e^{-\lambda x}\]

Here is a soccer version of that rate idea: suppose the model predicts two scoring events per hour. The expected time until the next scoring event is 1 divided by 2 hours, or 30 minutes. The real match can be very different; the model expresses long-run averages.

Keep the professor’s exact example. The lecture says X is Exponential with rate five per hour and asks for the probability the first customer arrives between 15 and 60 minutes. Convert 15 minutes to 0.25 hours and 60 minutes to one hour, because lambda is per hour. Then subtract the two CDF values. The same calculation could describe waiting for a soccer event at a five-per-hour rate.

\[P(0.25<X<1)=F(1)-F(0.25)=e^{-5(0.25)}-e^{-5(1)}\approx0.2798\]

Third, Normal.

The Normal distribution is the bell-shaped curve. It is symmetric and unimodal, centered at mean mu, with spread controlled by standard deviation sigma.

You may see X distributed Normal with parameters mu and sigma squared. The second parameter in that notation is VARIANCE. The standard deviation is sigma, which is the square root of the variance. Always check which one a problem gives.

\[X\sim N(\mu,\sigma^2),\qquad \sigma=\sqrt{\sigma^2}\]

The Normal distribution is important because many real measurements are roughly bell-shaped and because the Central Limit Theorem makes Normal models show up in inference even when the original population is not perfectly Normal.

The 68-95-99.7 rule says that for a roughly Normal distribution, about 68 percent of values are within one standard deviation of the mean, about 95 percent are within two, and about 99.7 percent are within three.

Soccer example: suppose goalkeeper reaction times are approximately Normal, with mean 0.40 seconds and standard deviation 0.04 seconds. About 68 percent should fall between 0.36 and 0.44 seconds. About 95 percent should fall between 0.32 and 0.48 seconds. This is approximate, not a substitute for the z-table.


## CHAPTER 4 — Z-SCORES AND THE Z-TABLE

A z-score converts a raw value into “how many standard deviations from the mean.”

Here is the actual z-score formula. On paper it has a fraction: x minus the population mean, divided by the population standard deviation.

\[z=\frac{x-\mu}{\sigma}\]

If z equals positive 2, the value is two standard deviations above the mean. If z equals negative 1.3, the value is 1.3 standard deviations below the mean.

Now the table. This matters because the professor says the exam will provide the z-table and you must use it.

Your z-table gives the area to the LEFT of z. That is the entire trick.

Suppose the standard score is z equal to 1.20. In your provided table, find row 1.2 and column .00. The entry is 0.8849. That is the cumulative probability to the left of z equal to 1.20.

\[P(Z\le1.20)=0.8849\]

If the question instead asks for the area to the right of that score, subtract 0.8849 from one. The result is 0.1151.

\[P(Z>1.20)=1-0.8849=0.1151\]

If z equals negative 1.20, the table directly gives the left-tail area, 0.1151. For negative scores, make sure you use the negative half of the table.

\[P(Z<-1.20)=0.1151\]

If you need area between two z-scores, take the larger left-area minus the smaller left-area.

For a two-sided outside probability beyond plus or minus some z, find one tail and multiply by 2 if the Normal curve is symmetric.

Example: for z equal to 2.00, the table gives 0.9772 to the left. The right-tail area is 0.0228. The probability of being beyond either positive 2 or negative 2 is twice that, 0.0456.

\[P(|Z|>2)=2(1-0.9772)=0.0456\]

The z-table is used whenever the relevant standardized statistic follows the standard Normal distribution. On this exam that includes Normal probability questions, confidence intervals for proportions, and hypothesis tests for proportions.


## CHAPTER 5 — THE CENTRAL LIMIT THEOREM AND STANDARD ERROR

Now we bridge Module 4 into Module 5.

Imagine repeating a goalkeeper reaction-time study. Each time, randomly sample 50 goalkeepers, compute their average reaction time, and keep that average. The individual athletes have their own variation, but the collection of sample averages has a new distribution called the sampling distribution.

The Central Limit Theorem says that with a sufficiently large random sample, the distribution of the sample mean is approximately Normal. Its center remains mu. Its standard error is sigma divided by the square root of n. That is why many statistics calculations use a bell curve even when individual observations are not perfectly bell-shaped.

\[\bar X\approx N\left(\mu,\frac{\sigma^2}{n}\right),\quad SE(\bar X)=\frac{\sigma}{\sqrt n}\]

That standard deviation of a statistic is called its standard error.

This is a core idea: standard deviation describes variation among individual observations. Standard error describes variation among sample statistics from repeated samples.

As n gets larger, square root of n gets larger, so standard error gets smaller. Bigger sample means more precise estimate.

This explains why sample size matters so much in Modules 5 and 6.


## CHAPTER 6 — CONFIDENCE INTERVALS: WHAT ARE THEY ACTUALLY DOING?

A confidence interval is a range of plausible values for an unknown population parameter.

The universal two-sided confidence interval structure is written with a point estimate and a margin of error.

\[\text{Confidence interval}=\text{point estimate}\pm\text{margin of error}\]

On paper, the margin of error is the critical value times the standard error. That single pattern is hiding underneath all the confidence-interval formulas in this unit.

\[\text{Margin of error}=\text{critical value}\times\text{standard error}\]

Margin of error equals critical value times standard error.

So every confidence interval problem becomes three questions.

One: what parameter am I estimating?

Two: what is the point estimate and standard error for that parameter?

Three: do I use a z critical value or a t critical value?

This is the decision process I want you to memorize.

If the question asks for the percentage of goalkeepers who prefer natural grass, the target is one proportion p. Use p-hat and the z-table.

If you compare the percentages of goalkeepers versus outfield players who prefer grass, the target is p-one minus p-two. Use the difference of sample proportions and z.

If the question asks for the true average goalkeeper reaction time, the target is one mean mu. Use the sample mean and Student’s t with n minus one degrees of freedom.

If you compare average reaction time for two independent goalkeeper training groups, the target is mu-one minus mu-two. Use a two-sample t procedure with Welch degrees of freedom.

If the data are paired, turn the data into one list of differences and use a one-sample t interval on the mean difference.

Let’s go one by one.


## ONE PROPORTION CONFIDENCE INTERVAL

Use this when the question asks for one population percentage or proportion.

The actual confidence interval for one population proportion is shown below. Read the symbol p-hat as the observed fraction in the sample, q-hat as the opposite fraction, and n as the number sampled.

\[\boxed{\hat p\pm z^*\sqrt{\frac{\hat p(1-\hat p)}{n}}}\]

Here the hat means a sample estimate, the star means a critical cutoff, and n is the number of players. A fraction in the square root gives the standard error.

In that formula, q-hat equals one minus p-hat. The square root is the standard error. Z-star is the critical value from the confidence level. For 95 percent confidence you look for 0.9750 cumulative left-area, giving z-star about 1.96.

For a 95 percent two-sided interval, you want 95 percent in the middle, leaving 2.5 percent in each tail. Because your z-table gives left area, look for .9750. That gives z-star about 1.96.

Your lecture’s voter example had p-hat around .514 with a large sample and produced a 95 percent confidence interval roughly from 50.42 percent to 52.38 percent. Interpretation: we are 95 percent confident that the true population proportion lies in that interval.

Do NOT say there is a 95 percent probability that the fixed population parameter is in this particular interval. The professor explicitly flags that as false. The formal repeated-sampling meaning is that if we repeatedly took samples and built intervals this way, about 95 percent of the intervals would capture the true parameter.


## TWO PROPORTIONS CONFIDENCE INTERVAL

Use this when comparing two independent groups on a yes/no outcome.

The point estimate is the difference between the observed percentages in the two separate soccer groups.

The standard error combines the variation from each group, with a separate proportion and sample size for each.

\[SE(\hat p_1-\hat p_2)=\sqrt{\frac{\hat p_1(1-\hat p_1)}{n_1}+\frac{\hat p_2(1-\hat p_2)}{n_2}}\]

Subscripts one and two mean the two independent soccer groups. Do not reuse one group’s n for the other.

Multiply that standard error by z-star, then add and subtract it from the observed difference in sample proportions.

\[\boxed{(\hat p_1-\hat p_2)\pm z^*SE(\hat p_1-\hat p_2)}\]

If the interval contains zero, no population difference is plausible. If the entire interval is positive, group 1 likely has the larger proportion. If the entire interval is negative, group 1 likely has the smaller proportion.


## ONE MEAN CONFIDENCE INTERVAL

Use this when estimating one population average and population sigma is unknown, which is the normal situation in this class.

Here is the one-mean confidence interval in real mathematical notation. Read x-bar as the sample average, s as the sample standard deviation, and n as the sample size.

\[\boxed{\bar x\pm t^*_{n-1}\frac{s}{\sqrt n}}\]

The term n minus one underneath t-star is its degrees of freedom. It does not mean you subtract one from the t critical value.

The standard error is s over square root n. Degrees of freedom are n minus 1.

This is where the t-table comes in.


## CHAPTER 7 — WHAT IS THE T-DISTRIBUTION AND HOW DO I USE THE T-TABLE?

The t-distribution looks like a Normal bell curve but has heavier tails. It accounts for the extra uncertainty created because we do not know the population standard deviation sigma and must estimate it using the sample standard deviation s.

The t-distribution changes depending on degrees of freedom. With small degrees of freedom, the tails are heavier. As degrees of freedom become very large, the t-distribution approaches the standard Normal distribution.

Your t-table is different from your z-table. The z-table gives cumulative area to the LEFT of z. The t-table gives a CRITICAL t value for a chosen UPPER-TAIL probability and a chosen degrees of freedom.

So with t, you do not usually search for an exact p-value the same way. You choose the row for degrees of freedom and the column for the upper-tail area you need.

For a 95 percent two-sided confidence interval, alpha equals .05 total, so each tail has .025. Go to df equals n minus 1, then the .025 upper-tail column. That t value is t-star.

For a 90 percent two-sided interval, each tail is .05, so use the .05 upper-tail column.

For a one-sided 90 percent lower confidence bound, you keep 90 percent above the lower bound, so alpha is .10 in the lower tail. Because the t table is an upper-tail table and the t distribution is symmetric, you can use the positive t critical value with upper-tail .10 and place it into the correct lower-bound formula.

\[\text{one-sided lower bound}=\hat\theta-c^*SE,\quad \text{upper bound}=\hat\theta+c^*SE\]

One-sided intervals have only one finite endpoint. A lower confidence bound looks like point estimate minus margin of error, up to infinity. An upper confidence bound looks like negative infinity up to point estimate plus margin of error.


## TWO INDEPENDENT MEANS CONFIDENCE INTERVAL

Use when comparing averages from two separate, independent groups.

The point estimate is the difference between two independent sample averages.

The standard error adds the estimated variance divided by sample size for each group, and then takes the square root.

\[SE(\bar x_1-\bar x_2)=\sqrt{\frac{s_1^2}{n_1}+\frac{s_2^2}{n_2}}\]

Use a t critical value with Welch degrees of freedom. Your professor calls it the “crazy df.” On the exam, if you need it, use the provided formula or information.

\[\nu\approx\frac{(s_1^2/n_1+s_2^2/n_2)^2}{\frac{(s_1^2/n_1)^2}{n_1-1}+\frac{(s_2^2/n_2)^2}{n_2-1}}\]

The Greek letter nu, or df, labels the Welch approximate degrees of freedom. If the table lacks that exact row, use the professor’s specified rounding convention or a conservative lower row.

Again, zero is the key reference. If a confidence interval for mu1 minus mu2 contains zero, equal population means remain plausible.


## PAIRED DIFFERENCE CONFIDENCE INTERVAL

Use paired methods when each observation has a natural partner. Soccer example: each goalkeeper completes the same reflex drill before training and again after training. Compute each player’s after-minus-before difference. Another example is taking both left-foot and right-foot passing accuracy measurements on the same players.

Do not treat these as two independent samples. First compute each pair’s difference d. Then you have one sample of differences.

Here is the paired-data confidence interval. D-bar is the average of the player-by-player differences; s-sub-d is the standard deviation of those differences; n is the number of pairs, not the number of individual measurements.

\[\boxed{\bar d\pm t^*_{n-1}\frac{s_d}{\sqrt n}}\]

If a problem says “same individuals before and after,” think PAIRED immediately.


## CHAPTER 8 — CONFIDENCE INTERVAL SAMPLE SIZE FOR A PROPORTION

The professor’s guide specifically says you should be able to calculate the sample size needed for a desired margin of error for proportions.

Begin with the margin-of-error formula for a single proportion, then algebraically rearrange it to solve for the sample size.

\[E=z^*\sqrt{\frac{\hat p(1-\hat p)}{n}}\]

Solve for n:

Here is that solved sample-size equation. Remember that E is your target margin of error, expressed as a proportion rather than a percentage.

\[\boxed{n=\left\lceil\frac{(z^*)^2\hat p(1-\hat p)}{E^2}\right\rceil}\]

If a prior estimate for p-hat is given, use it. If no estimate is given, use p-hat equals .5 and q-hat equals .5. Why? Because .5 times .5 equals .25, the largest possible p times q, so it gives the safest, largest required sample size.

Always round required sample size UP, because a smaller sample would fail to guarantee the desired margin of error.

Example: 95 percent confidence, margin of error .01, no prior estimate. z-star is 1.96. n equals 1.96 squared times .25 divided by .01 squared. That is about 9,604. Round up if needed.

\[n=\left\lceil\frac{1.96^2(0.5)(0.5)}{0.01^2}\right\rceil=9604\]


## CHAPTER 9 — HYPOTHESIS TESTING: THE BIG IDEA

Confidence intervals ask, “What parameter values are plausible?”

Hypothesis tests ask, “Is this specific claim about the parameter compatible with the sample?”

Every hypothesis test has two hypotheses.

The null hypothesis, H-zero, is the default claim you assume for the calculation. It normally contains equality.

The alternative hypothesis, H-a, is what you are trying to find evidence for. It can be less than, greater than, or not equal.

The alternative must be chosen before looking at the sample result. You cannot look at the data and then choose whichever direction makes the p-value smaller.

The workflow is:

State H-zero and H-a.

Check conditions.

Calculate the test statistic.

Use the correct distribution and tail to find the p-value.

Compare p-value with alpha.

Write the conclusion in context.

The p-value is one of the most misunderstood ideas, so let’s slow down.

The p-value is NOT the probability that H-zero is true.

Instead, assume H-zero is true. Then ask: what is the probability of seeing a sample result this extreme or even more extreme, in the direction described by H-a?

That is the p-value.

Small p-value means the observed sample would be hard to explain if H-zero were true, so we reject H-zero.

Large p-value means the sample is reasonably compatible with H-zero, so we fail to reject H-zero.

Decision rule: if the p-value is less than or equal to alpha, reject H-zero. Otherwise fail to reject H-zero. In most exam examples exact equality is unlikely, but the conventional rule includes equality.

\[p\text{-value}\le\alpha\Rightarrow\text{reject }H_0;\qquad p\text{-value}>\alpha\Rightarrow\text{fail to reject }H_0\]


## CHAPTER 10 — TAILS: HOW H-A TELLS YOU THE P-VALUE AREA

This is a calculation skill you absolutely want automatic.

If H-a says parameter is LESS THAN the null value, use the area BELOW the test statistic. Left-tailed test.

\[H_a:\theta<\theta_0\Rightarrow\text{left-tail p-value}\]

If H-a says GREATER THAN, use the area ABOVE the test statistic. Right-tailed test.

\[H_a:\theta>\theta_0\Rightarrow\text{right-tail p-value}\]

If H-a says NOT EQUAL, use both outside tails. Two-sided test.

\[H_a:\theta\ne\theta_0\Rightarrow\text{two-tail p-value}\]

For a z-test, because your z-table gives area below:

Left-tail p-value: read the table directly.

Right-tail p-value: one minus the table value.

Two-sided p-value: take the one-tail extreme area and multiply by two.

Keep the professor’s exact voter example: null p equals 0.52, alternative p less than 0.52, sample size 10,000, and p-hat equals 0.514. This is a left-tail one-proportion z-test.

The one-proportion z test statistic is:

The one-proportion test statistic has a different standard error from the confidence interval. It uses p-zero from the null hypothesis and q-zero equal to one minus p-zero.

\[\boxed{z=\frac{\hat p-p_0}{\sqrt{p_0(1-p_0)/n}}}\]

P-zero is the proportion asserted under the null. The numerator compares the observed sample fraction with that claim. The denominator measures how much normal sample fluctuation the null predicts.

Notice something important: in a hypothesis test, the standard error uses p-zero from the null, not p-hat. That is different from a confidence interval, which uses p-hat.

Plugging in gives z about negative 1.2.

Because H-a is less than, use the area below negative 1.2. The z-table gives .1151. If alpha is .05, .1151 is larger than .05, so fail to reject H-zero. There is not enough evidence to claim that true support is below 52 percent.

\[z=\frac{0.514-0.52}{\sqrt{0.52(0.48)/10000}}\approx-1.20,\quad p=0.1151\]


## CHAPTER 11 — WHICH HYPOTHESIS TEST FORMULA DO I USE?

Again, start by identifying the parameter.


## ONE PROPORTION TEST

Use for one population percentage.

For one population percentage, use the following one-proportion z-test formula. The null proportion is p-zero, not the sample p-hat.

\[z=\frac{\hat p-p_0}{\sqrt{p_0(1-p_0)/n}}\]

Use z-table.


## TWO PROPORTIONS TEST

Use to compare two independent population proportions.

Your professor’s original lecture compares female and male students who prefer cats. The female sample is 13 out of 45, and the male sample is 16 out of 74. We keep these original numbers as the lecture taught them.

The null says p-F minus p-M equals zero. The alternative says p-F minus p-M is greater than zero.

The lecture standardizes that sample difference and reports z about 0.878 with a one-sided p-value about 0.1894. That is bigger than alpha 0.10, so the lecture concludes insufficient evidence. Follow the exact method taught in class for this professor example; a textbook may introduce a pooled-null variant of the two-proportion test.

\[z_{\mathrm{lecture}}\approx0.878,\quad p_{\mathrm{right}}\approx0.1894>\alpha=0.10\]

Because this is an instructor example, the lecture’s unpooled standardization is used for the reported numerical result. Do not silently substitute a pooled-test calculation when reproducing that lecture result.

For exam recognition: two separate groups plus yes/no outcome equals two-proportion z procedure.


## ONE MEAN TEST

Use for one population average.

Test statistic:

This is the exact one-sample mean t-test statistic. X-bar is the observed sample average; mu-zero is the claimed mean; s divided by square root n is the estimated standard error.

\[\boxed{t=\frac{\bar x-\mu_0}{s/\sqrt n}},\quad df=n-1\]

T measures how many estimated standard errors the observed sample mean lies above or below the null mean.

Use t distribution with df n minus 1.

Professor’s GPA example: H-zero mu equals 4.1 versus H-a mu not equal 4.1. Sample n equals 114, x-bar equals 4.2317, s equals .3664.

\[t=\frac{4.2317-4.1}{0.3664/\sqrt{114}}\approx3.84\]

The t statistic is about 3.84. Because the alternative is not equal, it is a two-sided test. The p-value is extremely small, less than .001 in the table-based conclusion. If alpha is .02, reject H-zero. There is evidence that the population mean high school GPA differs from 4.1.


## TWO INDEPENDENT MEANS TEST

Use for two separate groups and a numerical response.

Test statistic:

The two-independent-means t statistic divides the observed difference minus the hypothesized difference by the combined standard error. In the professor’s test the hypothesized difference is zero.

\[\boxed{t=\frac{(\bar x_1-\bar x_2)-\Delta_0}{\sqrt{s_1^2/n_1+s_2^2/n_2}}}\]

Delta-zero is the hypothesized difference between group means, commonly zero. The denominator combines the uncertainty from both separate groups.

Use Welch t and the crazy degrees of freedom.

Professor example: first-gen mean GPA about 4.1467 versus non-first-gen mean about 4.2466. The test statistic is about negative 1.083. The one-sided p-value is about .145. At alpha .03, fail to reject. There is not enough evidence that first-gen students have a lower population mean GPA.

\[t\approx-1.083,\quad df\approx22.38,\quad p\approx0.145\]


## PAIRED MEAN TEST

If the same people or units are measured twice, calculate differences first and perform a one-sample t test on the differences:

For paired data, work with the individual before-after differences. This is a one-sample t-test on d, rather than a two-independent-samples test.

\[\boxed{t=\frac{\bar d-d_0}{s_d/\sqrt n}},\quad df=n-1\]

D-zero is the difference claimed under the null, commonly zero. Calculate a single player-level difference first, then its mean and standard deviation.

Usually d-zero is zero.


## CHAPTER 12 — CONDITIONS: WHEN ARE THE FORMULAS LEGAL?

Your professor explicitly says to check conditions.

For one proportion:

Randomization.

10 percent condition.

Success/failure condition.

For two proportions:

Randomization for both groups.

10 percent condition for both.

Success/failure for both.

Independent samples.

For one mean:

Randomization.

10 percent condition.

Large enough or sufficiently Normal data.

For two independent means:

Randomization for both.

10 percent for both.

Large enough or sufficiently Normal for both.

Independent samples.

Randomization is usually satisfied if the problem tells you it is a random sample.

The 10 percent condition means your sample should not be more than 10 percent of the population when sampling without replacement. This helps justify independence among observations.

For proportions, success/failure means enough expected successes and failures. For a confidence interval, use n times p-hat and n times q-hat, and both should be at least 10. For a hypothesis test, use n times p-zero and n times q-zero, and both should be at least 10.

\[\text{CI: }n\hat p\ge10,\ n(1-\hat p)\ge10;\qquad \text{test: }np_0\ge10,\ n(1-p_0)\ge10\]

For means, your professor’s guide gives a practical rule: if there is some skew, n greater than 30 may be enough; if there is a lot of skew, you may want n greater than 100. If the sample is small, look for a roughly Normal shape and no severe outliers.


## CHAPTER 13 — TYPE I ERROR, TYPE II ERROR, ALPHA, BETA, AND POWER

This is likely multiple-choice material, but it is easy points if the definitions are clean.

A Type I error means rejecting a true null hypothesis. Its probability is alpha.

A Type II error means failing to reject a false null hypothesis. Its probability is beta.

Power equals one minus beta. Power is the probability that the test correctly detects a false null hypothesis.

\[\text{Power}=1-\beta\]

Soccer decision analogy: suppose H-zero says a goalkeeper training program causes no improvement. A Type I error would be declaring an improvement that does not actually exist. A Type II error would be missing a real improvement. Those are different kinds of mistakes.

What increases power? Larger sample size. Larger effect size. Often a larger alpha, although that also raises Type I error risk.

Effect size means how far the true parameter is from the null value. It is easier to detect a huge difference than a tiny one.


## CHAPTER 14 — CONFIDENCE INTERVALS AND HYPOTHESIS TESTS ARE TWO VIEWS OF THE SAME IDEA

A two-sided hypothesis test at alpha .05 and a 95 percent two-sided confidence interval tell closely related stories.

\[\text{Two-sided 95\% CI}\ \longleftrightarrow\ \text{two-sided test at }\alpha=0.05\]

If the null value is outside the confidence interval, you would reject the corresponding null at that level.

If the null value is inside the interval, you would fail to reject.

For a difference between groups, the null value is usually zero. So if a confidence interval for p1 minus p2 or mu1 minus mu2 contains zero, “no difference” is still plausible.

This is a fantastic exam cross-check. If your CI includes zero but your two-sided test says reject equality at the matching level, something probably went wrong.


## CHAPTER 15 — YOUR EXAM-DAY DECISION TREE

Now I want to compress everything into a sequence you can mentally run during a calculation question.

Step 1: What is the question asking about?

A probability for a continuous random variable? Stay in Module 4.

A range estimating a population parameter? Confidence interval, Module 5.

Evidence for or against a specific claim? Hypothesis test, Module 6.

Step 2: What parameter?

One proportion: p.

Difference of proportions: p1 minus p2.

One mean: mu.

Difference of independent means: mu1 minus mu2.

Paired before-after data: mean difference mu-d.

Step 3: z or t?

Proportions: z.

Means: t.

Normal raw-value probability with known mu and sigma: standardize to z and use z-table.

Every two-sided confidence interval follows the same pattern, with the exact critical value and standard error depending on the parameter.

\[\mathrm{CI}=\mathrm{PE}\pm c^*\times SE\]

For a single population proportion, the formula is:

\[\hat p\pm z^*\sqrt{\frac{\hat p(1-\hat p)}{n}}\]

For a difference between two independent proportions, the formula is:

\[(\hat p_1-\hat p_2)\pm z^*\sqrt{\frac{\hat p_1(1-\hat p_1)}{n_1}+\frac{\hat p_2(1-\hat p_2)}{n_2}}\]

For one population mean, the formula is:

\[\bar x\pm t^*_{n-1}\frac{s}{\sqrt n}\]

For two independent population means, the formula is:

\[(\bar x_1-\bar x_2)\pm t^*_{\nu}\sqrt{\frac{s_1^2}{n_1}+\frac{s_2^2}{n_2}}\]

For a paired before-after mean difference, the formula is:

\[\bar d\pm t^*_{n-1}\frac{s_d}{\sqrt n}\]

Step 5: If it is a hypothesis test, write H-zero and H-a before calculating.

Use the alternative to know the tail.

Less than — left.

Greater than — right.

Not equal — both.

Step 6: Check conditions.

Step 7: Calculate test statistic.

Step 8: Use the correct table.

Z-table: area to the left.

T-table: upper-tail critical values by degrees of freedom.

Step 9: Compare p-value to alpha.

P less than alpha: reject H-zero.

P greater than alpha: fail to reject H-zero.

Step 10: Write the conclusion in context. Do not say “accept the null.” Say “fail to reject.” Do not say the p-value is the probability H-zero is true.


## CHAPTER 16 — WORDING CUES THAT SHOULD TRIGGER A METHOD

Let’s make this automatic.

“Probability that a continuous measurement is between…” — integrate PDF or use CDF difference. If Normal, standardize and use z-table.

“Equally likely anywhere between a and b” — Uniform.

“Time until the next or first event” — Exponential.

“Bell-shaped, mean and SD given” — Normal.

“Estimate the percentage of all…” — one-proportion confidence interval.

“Estimate difference in percentages between group A and B” — two-proportion confidence interval.

“Estimate the average of all…” — one-mean t interval.

“Estimate difference in average between two separate groups” — two-independent-means t interval.

“Before and after on the same people” — paired t method.

“Is the true proportion equal to, less than, or greater than…” — one-proportion z test.

“Do these two groups have different proportions?” — two-proportion z test.

“Is the true mean equal to…” — one-sample t test.

“Do these two independent groups have different means?” — two-sample Welch t test.

If the wording asks for a sample size that achieves margin of error E for a proportion, use the squared z-star formula shown earlier. Use the conservative 0.5 and 0.5 if no previous estimate exists.

\[n=\left\lceil(z^*)^2\frac{\hat p(1-\hat p)}{E^2}\right\rceil\]


## CHAPTER 17 — COMMON TRAPS

Trap 1: Mixing up p and p-value. p is a population proportion. p-value is evidence in a hypothesis test.

Trap 2: Using p-hat in the one-proportion hypothesis-test standard error. The test uses p-zero. The confidence interval uses p-hat.

Trap 3: Using z for means. In this course, means generally use t because sigma is unknown.

Trap 4: Reading the z-table backward. It gives area to the LEFT.

Trap 5: Reading the t-table like the z-table. It does not give cumulative probabilities. It gives t critical values for upper-tail probabilities and degrees of freedom.

Trap 6: Forgetting to split alpha in half for a two-sided confidence interval. A 95 percent two-sided interval has .025 in each tail.

Trap 7: Forgetting to double a one-tail p-value for a symmetric two-sided test.

Trap 8: Treating paired data like independent groups.

Trap 9: Saying “there is a 95 percent probability the parameter is in the interval.” Use “we are 95 percent confident.”

Trap 10: Saying “accept H-zero.” Correct language is “fail to reject H-zero.”

Trap 11: Ignoring units. If lambda is per hour and the question gives minutes, convert units first.

Trap 12: Forgetting zero when interpreting a difference interval. Zero means no difference.


## CHAPTER 18 — FINAL WALK-THROUGH: ONE COMPLETE EXAM-STYLE SCENARIO

Full soccer problem. A coach claims the mean goalkeeper reaction time in a reflex drill is 0.400 seconds. You suspect the group is actually SLOWER, meaning the mean time is greater than 0.400. You randomly sample 36 goalkeepers and observe an average of 0.424 seconds, with sample standard deviation 0.060 seconds. Use significance level 0.05.

First identify the task: this is a hypothesis test because we are evaluating a specific claimed population mean.

The parameter is a mean, mu, so use Student’s t and the t-table, not z.

The null says the true mean reaction time is 0.400 seconds. The alternative says the true mean is greater than 0.400 seconds. Because the alternative is greater than, this is right-tailed.

Conditions: the problem says random sample. For the 10 percent condition, the population of eligible goalkeepers should be more than 360 if sampling without replacement. With n equals 36, the t method may be reasonable if the reaction times are not heavily skewed or affected by severe outliers.

Use the one-sample t formula, with the observed mean minus the null mean divided by s over the square root of n.

\[t=\frac{\bar x-\mu_0}{s/\sqrt n}\]

The numerator is 0.424 minus 0.400, which equals 0.024. The standard error is 0.060 divided by square root of 36, or 0.010. Divide and get t equal to 2.4.

\[t=\frac{0.424-0.400}{0.060/\sqrt{36}}=\frac{0.024}{0.010}=2.40\]

Degrees of freedom equal 36 minus one, or 35.

Because the alternative is greater than, find the RIGHT-tail area above positive 2.4. On your t-table with 35 degrees of freedom, 2.4 falls between the critical values for upper-tail probabilities 0.025 and 0.01. Therefore the p-value is between 0.01 and 0.025.

Since that entire p-value range is below alpha 0.05, reject the null. There is enough evidence that the average goalkeeper reaction time exceeds 0.400 seconds in this group, meaning the average performance is slower than the claimed target.

Now see how everything fits together? Identify parameter. Pick z or t. Write the correct standard error. Determine the tail from H-a. Use the table correctly. Compare p to alpha. Conclude in words.


## CHAPTER 19 — FINAL WALK-THROUGH: CONFIDENCE INTERVAL SCENARIO

Another soccer problem. In a random sample of 100 soccer players, 62 prefer morning training. You want a 95 percent confidence interval for the true percentage of similar players who prefer morning training.

Parameter is one proportion p. Point estimate p-hat is .62. q-hat is .38. Use z because proportions use z.

For 95 percent two-sided confidence, z-star is 1.96.

Standard error is square root of .62 times .38 divided by 100. Margin of error is 1.96 times that standard error.

\[SE=\sqrt{\frac{(0.62)(0.38)}{100}}\approx0.04854,\quad E=1.96SE\approx0.0951\]

The interval is the sample proportion 0.62 plus or minus that margin of error. Numerically, the margin is about 0.095, giving a confidence interval of roughly 0.525 to 0.715, or 52.5 to 71.5 percent.

\[0.62\pm0.0951=(0.5249,\ 0.7151)\]

Before finalizing, check success/failure: 100 times .62 equals 62 and 100 times .38 equals 38, both at least 10. Randomization and 10 percent should also be satisfied from the problem context.

Interpretation: we are 95 percent confident the true population proportion is between the two endpoints you calculate.

If instead the question asked, “Is the true proportion greater than .50?” that becomes a hypothesis test. Then H-zero p equals .50, H-a p greater than .50, and the test standard error uses .50 times .50, not .62 times .38.

\[H_0:p=0.50,\quad H_a:p>0.50,\quad SE_{H_0}=\sqrt{\frac{0.5(0.5)}{100}}\]

That comparison between CI and test is exactly the sort of distinction you should be able to make quickly.


## CHAPTER 20 — LAST FIVE MINUTES: WHAT TO REMEMBER IF EVERYTHING ELSE DISAPPEARS

If you remember nothing else, remember these ten things.

One: continuous probability is AREA under a PDF. Exact-point probability is zero.

Two: Uniform means flat; Exponential means waiting until first event; Normal means symmetric bell curve.

Three: z-score means number of standard deviations from the mean.

Four: your z-table gives AREA TO THE LEFT.

Five: confidence interval equals point estimate plus or minus critical value times standard error.

Six: proportions use z; means use t.

Seven: your t-table uses degrees of freedom and UPPER-TAIL probability.

Eight: hypothesis-test alternative tells you the tail: less left, greater right, not equal both.

Nine: p-value less than alpha means reject H-zero; otherwise fail to reject.

Ten: always identify the parameter before touching a formula.

If you practice that decision process, the formulas stop looking like random symbols. Every formula is just the same basic idea: take what your sample says, measure its uncertainty with a standard error, and compare it to what you want to estimate or test.

That is the real structure behind this entire exam.


## OUTRO — HOW TO REPLAY THIS EPISODE

When you listen again, do not try to memorize every sentence. On the second pass, focus on the transitions: probability to inference, proportion to mean, z to t, confidence interval to hypothesis test, and independent groups to paired data.

On the third pass, pause before each formula section and try to predict the formula yourself. Ask: what parameter is this? What is the point estimate? What is the standard error? Which table? Which tail?

If you can answer those five questions, you are no longer guessing your way through STAT 251. You understand the map.

End of podcast.


---

**Production note:** Video narration is the prose paragraphs. All display-math blocks must be shown precisely on screen during the adjacent prose; never read raw LaTeX code. Preserve every paragraph, example, numeric value and conclusion.
