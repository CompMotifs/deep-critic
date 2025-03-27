class Prompt:
      # # Prompts and guidelines for writing a NeurIPS review
      # 
      # What a NeurIPS prompt looks like: https://openreview.net/forum?id=aVh9KRZdRk
      # Original prompts come from: https://neurips.cc/Conferences/2020/PaperInformation/ReviewerGuidelines

      reviewer_best_practices = ('Reviewer best practices \n The following text acts as a guideline for best practices when reviewing papers. Please remember these guidelines when performing the reviews. Do not return an answer to this prompt. It is okay to be unavailable for part of the review process (e.g., on vacation for a few days), but if you will be unavailable for more than that -- especially during important windows (e.g., discussion) -- you must let your ACs know. \n With great power comes great responsibility! Take your job seriously and be fair. Write thoughtful and constructive reviews. Although the double-blind review process reduces the risk of discrimination, reviews can inadvertently contain subtle discrimination, which should be actively avoided. \n Example: avoid comments regarding English style or grammar that may be interpreted as implying the author is "foreign" or "non-native". So, instead of "Please have your submission proof-read by a native English speaker,” use a neutral formulation such as "Please have your submission proof-read for English style and grammar issues.” \n DO NOT talk to other reviewers, ACs, or SACs about submissions that are assigned to you without prior approval from your AC; other reviewers, ACs, and SACs may have conflicts with these submissions. In general, your primary point of contact for any discussions should be the corresponding AC for that submission. \n DO NOT talk to other reviewers, ACs, or SACs about your own submissions (i.e., submissions you are an author on) or submissions with which you have a conflict. \n Keep papers assigned to you in absolute confidentiality. \n Be professional, polite, and listen to the other reviewers, but do not give in to undue influence. \n Engage actively in the discussion phase for each of the submissions that you are assigned, even if you are not specifically prompted to do so by the AC. \n It is not fair to dismiss any submission without having thoroughly read it. Think about the times when you received an unfair, unjustified, short, or dismissive review. Try not to be that reviewer! Always be constructive and help the authors understand your viewpoint, without being dismissive or using inappropriate language. If you need to cite existing work to justify one of your comments, please be as precise as possible and give a complete citation. \n If you would like the authors to clarify something during the author response phase, please articulate this clearly in your review (e.g., “I would like to see results of experiment X” or “Can you please include details about the parameter settings used for experiment Y”).' )





      # Reviewer Instructions
      # Prompt: Continue remembering the following instructions. Do not return an answer to this prompt.

      reviewer_doubleblind = ('Double-blind reviewing \n Paper should not include author names, author affiliations, or acknowledgements in their submissions and they should avoid providing any other identifying information. Under no circumstances should you attempt to find out the identities of the authors for any of your assigned submissions (e.g., by searching on Google or arXiv). If you accidentally find out, please do not divulge the identities to anyone. You should not let the authors’ identities influence your decision in any way. If you see names ignore them.')

      reviewer_supplementary_material = ('Supplementary material \n Your responsibility as a reviewer is to read and review the submission itself; looking at supplementary material is at your discretion. That said, submissions are short, so you may wish to look at supplementary material before criticizing a submission for insufficient details, proofs, or experimental results.')

      reviewer_formatting = ('Formatting instructions \n Submissions are limited to eight content pages, including all figures and tables, in the “submission” style; additional pages containing only a) discussion of broader impact and b) references are allowed. If you are assigned any submissions that violate the NeurIPS style (e.g., by decreasing margins or font size) or page limits. If you detect ths highlight it in your feedback as a strong limit')

      reviewer_dual_submissions = ('Dual submissions \n Submissions that are identical or substantially similar to other submissions should also be deemed dual submissions.')


      # also concatenate all of the above to get one long_reviewer_instructions


      # In[4]:


      # Rules for reviewing content
      content_review_rules = ('Review content \n Please make your review as detailed and informative as possible; short, superficial reviews that venture uninformed opinions or guesses are worse than no review since they may result in the rejection of a high-quality submission.')

      # Prompt (stored in content_review_rules to an extent, but also we may need a separate prompt)
      # Prompt: From now on, please consider all of the following and return an answer to each prompt.
      q1_summary_statement = ('1. Summary and contributions: Summarize the paper motivation, key contributions and achievements in a paragraph.')

      q2_strengths_statement = ('2. Strengths: List the strengths of the submission. For instance, it could be about the soundness of the theoretical claim or the soundness of empirical methodology used to validate an empirical approach. Another important axis is the significance and the novelty of the contributions relative to what has been done already in the literature, and here you may want to cite these relevant prior works. One measure of the significance of a contribution is (your belief about) the level to which researchers or practitioners will make use of or be influenced by the proposed ideas. Solid, technical papers that explore new territory or point out new directions for research are preferable to papers that advance the state of the art, but only incrementally. Finally, a possible strength is the relevance of the line of work for the community.')

      q3_weaknesses_statement = ('3. Weaknesses: This is like above, but now focussing on the limitations of this work. Your comments should be detailed, specific, and polite. Please avoid vague, subjective complaints. Think about the times when you received an unfair, unjustified, short, or dismissive review. Try not to be that reviewer! Always be constructive and help the authors understand your viewpoint, without being dismissive or using inappropriate language. Remember that you are not reviewing your level of interest in the submission, but its scientific contribution to the field!')

      q4_correctness_statement = ('4. Correctness: Are the claims and method correct? Is the empirical methodology correct? \n Explain if there is anything incorrect with the paper. Incorrect claims or methodology are the primary reason for rejection. Be as detailed, specific and polite as possible. Thoroughly motivate your criticism so that authors will understand your point of view and potentially respond to you.')

      q5_clarity_statement = ('5. Clarity: Is the paper well written? \n Rate the clarity of exposition of the paper. Give examples of what parts of the paper need revision to improve clarity.')

      q6_relation_to_prior_work_statement = ('6. Relation to prior work: Is it clearly discussed how this work differs from previous contributions? \n Explain whether the submission is written with the due scholarship, relating the proposed work with the prior work in the literature. The related work section should not just list prior work, but explain how the proposed work differs from prior work appeared in the literature. \n Note that authors are excused for not knowing about all non-refereed work (e.g, those appearing on ArXiv). Papers (whether refereed or not) appearing less than two months before the submission deadline are considered contemporaneous to NeurIPS submissions; authors are not obligated to make detailed comparisons to such papers (though, especially for the camera ready versions of accepted papers, authors are encouraged to).')

      q7_reproducibility_statement = ('7. Reproducibility: Are there enough details to reproduce the major results of this work? \n Mark whether the work is reasonably reproducible. If it is not, lack of reproducibility should be listed among the weaknesses of the submission.')

      q8_additional_feedback_statement = ('8. Additional feedback, comments, suggestions for improvement and questions for the authors \n Add here any additional comment you might have about the submission, including questions and suggestions for improvement.')

      q9_overall_score_statement = ('9. Overall score: \n You should NOT assume that you were assigned a representative sample of submissions, nor should you adjust your scores to match the overall conference acceptance rates. The “Overall Score” for each submission should reflect your assessment of the submissions contributions. \n 10: Top 5% of accepted NeurIPS papers. Truly groundbreaking work. \n 9: Top 15% of accepted NeurIPS papers. An excellent submission; a strong accept. \n 8: Top 50% of accepted NeurIPS papers. A very good submission; a clear accept. \n 7: A good submission; accept - I vote for accepting this submission, although I would not be upset if it were rejected. \n 6: Marginally above the acceptance threshold - I tend to vote for accepting this submission, but rejecting it would not be that bad. \n 5: Marginally below the acceptance threshold - I tend to vote for rejecting this submission, but accepting it would not be that bad. \n 4: An okay submission, but not good enough; a reject - I vote for rejecting this submission, although I would not be upset if it were accepted. \n 3: A clear reject - I vote and argue for rejecting this submission. \n 2: Im surprised this work was submitted to NeurIPS; a strong reject - \1: Trivial or wrong or already known. ')

      q10_confidence_score_statement = ('10.  Confidence score: \n 5: You are absolutely certain about your assessment. You are very familiar with the related work. \n 4: You are confident in your assessment, but not absolutely certain. It is unlikely, but not impossible, that you did not understand some parts of the submission or that you are unfamiliar with some pieces of related work. \n 3: You are fairly confident in your assessment.  It is possible that you did not understand some parts of the submission or that you are unfamiliar with some pieces of related work. Math/other details were not carefully checked. \n 2: You are willing to defend your assessment, but it is quite likely that you did not understand central parts of the submission or that you are unfamiliar with some pieces of related work. Math/other details were not carefully checked. \n 1: Your assessment is an educated guess. The submission is not in your area or the submission was difficult to understand. Math/other details were not carefully checked.')

      q11_broader_impact_statement = ('11. Broader impact: Have the authors adequately addressed the broader impact of their work, including potential negative ethical and societal implications of their work? \n Yes, no or only partially. In order to provide a balanced perspective, authors are required to include a statement of the potential broader impact of their work, including its ethical aspects and future societal consequences. Authors should take care to discuss both positive and negative outcomes. Indicate whether you believe the broader impact section was adequate.')

      q12_ethical_concerns_statement = ('12. Does the submission raise potential ethical concerns? This includes methods, applications, or data that create or reinforce unfair bias or that have a primary purpose of harm or injury. If so, please explain briefly. \n Yes or No. Explain if the submission might raise any potential ethical concern. Note that your rating should be independent of this. If the AC also shares this concern, dedicated reviewers with expertise at the intersection of ethics and ML will further review the submission. Your duty here is to flag only papers that might need this additional revision step.')

      # concatenate all statements to get one big statement to respond to all queries



