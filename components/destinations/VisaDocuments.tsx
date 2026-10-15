import type { DestinationDetails } from "@/lib/data/destination-details";

type VisaDocumentsProps = {
  details: DestinationDetails;
};

export default function VisaDocuments({
  details,
}: VisaDocumentsProps) {
  const guidance = details.visaAndDocuments;

  return (
    <section className="border-b border-border py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          {/* Header */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Visa & documents
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              What might you need?
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
              Review the common entry and travel documents you may need before
              planning your trip.
            </p>

            <VisaStatus status={guidance.status} />
          </div>

          {/* Documents */}
          <div>
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
              <h3 className="text-base font-semibold text-white">
                Visa guidance
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted">
                {guidance.summary}
              </p>

              {guidance.documents.length > 0 && (
                <div className="mt-7">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                    Common documents
                  </p>

                  <div className="mt-4 divide-y divide-border">
                    {guidance.documents.map((document) => (
                      <DocumentItem
                        key={document}
                        document={document}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-xl border border-border bg-surface-light p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                  Important
                </p>

                <p className="mt-2 text-xs leading-5 text-muted">
                  {guidance.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisaStatus({
  status,
}: {
  status: DestinationDetails["visaAndDocuments"]["status"];
}) {
  const statusConfig = {
    verify: {
      label: "Verify current requirements",
      description: "Requirements can change. Check official sources before travel.",
    },
    likely_required: {
      label: "Visa likely required",
      description: "Confirm the current visa rules before making arrangements.",
    },
    may_not_be_required: {
      label: "Visa may not be required",
      description: "Eligibility depends on nationality and current entry rules.",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="mt-6 rounded-2xl border border-primary/15 bg-primary-soft p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-sm text-primary">
          ✓
        </div>

        <div>
          <p className="text-sm font-semibold text-white">
            {config.label}
          </p>

          <p className="mt-1 text-xs leading-5 text-muted">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function DocumentItem({
  document,
}: {
  document: string;
}) {
  return (
    <div className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs text-primary">
        ✓
      </div>

      <p className="text-sm leading-6 text-muted">
        {document}
      </p>
    </div>
  );
}